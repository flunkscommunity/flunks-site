import UIKit
import WebKit
import Capacitor

/// Handles external wallet deep links (e.g. `wc:` / `flowwallet:`) from within the Capacitor WKWebView.
///
/// Problem: Universal links and custom URL schemes typically do not open the corresponding app
/// when navigated from inside WKWebView. This causes Dynamic's mobile auth flow to show
/// "Wallet not available" or to never open the Flow Wallet app.
///
/// Fix: Intercept wallet-related navigation and hand it off to iOS via `UIApplication.open`.
class WalletBridgeViewController: CAPBridgeViewController, WKNavigationDelegate, WKUIDelegate {

    private weak var forwardedNavigationDelegate: WKNavigationDelegate?
    private weak var forwardedUIDelegate: WKUIDelegate?

    private let externalSchemes: Set<String> = [
        "frw",
        "flowwallet",
        "flow-wallet",
        "flow-wallet-pro",
        "lilico",
        "blocto",
        "dapper",
        "wc"
    ]

    private let externalHosts: [String] = [
        "wallet.flow.com",
        "lilico.app",
        "frw-link.lilico.app",
        "r.walletconnect.com",
        "walletconnect.com",
        "walletconnect.org",
        "link.walletconnect.org",
        "accounts.meetdapper.com",
        "meetdapper.com",
        "wallet.blocto.app",
        "blocto.app"
    ]

    private func hostMatches(_ host: String) -> Bool {
        return externalHosts.contains(where: { host == $0 || host.hasSuffix("." + $0) })
    }

    private func shouldOpenExternally(_ url: URL) -> Bool {
        let urlString = url.absoluteString
        print("🔗 WalletBridge checking URL: \(urlString)")
        
        guard let schemeRaw = url.scheme?.lowercased() else { 
            print("🔗 WalletBridge: No scheme found")
            return false 
        }

        // Any non-web scheme should be opened by iOS.
        if schemeRaw != "http" && schemeRaw != "https" {
            let shouldOpen = externalSchemes.contains(schemeRaw)
            print("🔗 WalletBridge: Custom scheme '\(schemeRaw)', shouldOpen=\(shouldOpen)")
            return shouldOpen
        }

        // For wallet universal links, open externally so iOS can trigger the associated app.
        let host = (url.host ?? "").lowercased()
        if host.isEmpty || !hostMatches(host) {
            print("🔗 WalletBridge: Host '\(host)' not in external hosts list")
            return false
        }

        let path = url.path.lowercased()
        let query = (url.query ?? "").lowercased()
        print("🔗 WalletBridge: External host matched! host=\(host), path=\(path)")

        // Keep this narrow to wallet-connect style links.
        if path.contains("connect") || path.contains("wc") {
            print("🔗 WalletBridge: ✅ Opening externally - path contains connect/wc")
            return true
        }

        if query.contains("uri=") || query.contains("callback=") || query.contains("wc") {
            print("🔗 WalletBridge: ✅ Opening externally - query contains uri/callback/wc")
            return true
        }

        print("🔗 WalletBridge: ❌ Not opening externally - no match")
        return false
    }

    private func openExternally(_ url: URL) {
        print("🚀 WalletBridge: Opening externally: \(url.absoluteString)")
        DispatchQueue.main.async {
            UIApplication.shared.open(url, options: [:]) { success in
                print("🚀 WalletBridge: Open result: \(success)")
            }
        }
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        // Chain delegates so we don't break Capacitor's internal handling.
        if let webView = self.webView {
            forwardedNavigationDelegate = webView.navigationDelegate
            forwardedUIDelegate = webView.uiDelegate
            webView.navigationDelegate = self
            webView.uiDelegate = self
            
            // Inject JavaScript to intercept wallet-related window.open and anchor clicks
            injectWalletInterceptor(into: webView)
        }
    }
    
    /// Injects JavaScript that captures wallet deep links and dispatches them to native code
    private func injectWalletInterceptor(into webView: WKWebView) {
        let walletHosts = externalHosts.map { "\"\($0)\"" }.joined(separator: ", ")
        let walletSchemes = externalSchemes.map { "\"\($0)\"" }.joined(separator: ", ")
        
        let js = """
        (function() {
            if (window.__walletBridgeInstalled) return;
            window.__walletBridgeInstalled = true;
            
            const walletHosts = [\(walletHosts)];
            const walletSchemes = [\(walletSchemes)];
            
            function isWalletUrl(url) {
                try {
                    const parsed = new URL(url, window.location.href);
                    const scheme = parsed.protocol.replace(':', '').toLowerCase();
                    
                    // Check custom schemes
                    if (walletSchemes.includes(scheme)) {
                        console.log('🔗 JS WalletBridge: Custom scheme detected:', scheme);
                        return true;
                    }
                    
                    // Check wallet hosts
                    const host = parsed.hostname.toLowerCase();
                    const isWalletHost = walletHosts.some(wh => host === wh || host.endsWith('.' + wh));
                    if (isWalletHost) {
                        const path = parsed.pathname.toLowerCase();
                        const search = parsed.search.toLowerCase();
                        if (path.includes('wc') || path.includes('connect') ||
                            search.includes('uri=') || search.includes('wc')) {
                            console.log('🔗 JS WalletBridge: Wallet URL detected:', url);
                            return true;
                        }
                    }
                } catch (e) {
                    console.log('🔗 JS WalletBridge: URL parse error:', e);
                }
                return false;
            }
            
            // Override window.open for wallet URLs
            const originalWindowOpen = window.open;
            window.open = function(url, target, features) {
                console.log('🪟 JS WalletBridge: window.open called:', url);
                if (url && isWalletUrl(url)) {
                    console.log('🪟 JS WalletBridge: Redirecting wallet URL');
                    window.location.href = url;
                    return null;
                }
                return originalWindowOpen.call(window, url, target, features);
            };
            
            // Intercept anchor clicks
            document.addEventListener('click', function(e) {
                let target = e.target;
                while (target && target.tagName !== 'A') {
                    target = target.parentElement;
                }
                if (target && target.href && isWalletUrl(target.href)) {
                    console.log('🔗 JS WalletBridge: Anchor click intercepted:', target.href);
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = target.href;
                }
            }, true);
            
            // CRITICAL: Override HTMLAnchorElement.click to catch dynamically created anchors
            // fcl-wc creates detached <a> elements and calls click() on them for deep linking
            const originalAnchorClick = HTMLAnchorElement.prototype.click;
            HTMLAnchorElement.prototype.click = function() {
                if (this.href && isWalletUrl(this.href)) {
                    console.log('🔗 JS WalletBridge: Anchor.click() intercepted:', this.href);
                    window.location.href = this.href;
                    return;
                }
                return originalAnchorClick.call(this);
            };
            
            console.log('✅ JS WalletBridge interceptor installed (with anchor.click override)');
        })();
        """
        
        let script = WKUserScript(source: js, injectionTime: .atDocumentStart, forMainFrameOnly: false)
        webView.configuration.userContentController.addUserScript(script)
        print("✅ WalletBridge: JavaScript interceptor added")
    }

    func webView(_ webView: WKWebView,
                decidePolicyFor navigationAction: WKNavigationAction,
                decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        if let url = navigationAction.request.url {
            print("🌐 WalletBridge navigationAction: \(url.absoluteString)")
            if shouldOpenExternally(url) {
                print("🌐 WalletBridge: Intercepting navigation, opening externally")
                openExternally(url)
                decisionHandler(.cancel)
                return
            }
        }

        // Forward to the existing delegate if present; otherwise allow.
        if let forwardedNavigationDelegate,
           (forwardedNavigationDelegate as AnyObject) !== (self as AnyObject) {
            forwardedNavigationDelegate.webView?(webView, decidePolicyFor: navigationAction, decisionHandler: decisionHandler)
            return
        }

        decisionHandler(.allow)
    }

    func webView(_ webView: WKWebView,
                createWebViewWith configuration: WKWebViewConfiguration,
                for navigationAction: WKNavigationAction,
                windowFeatures: WKWindowFeatures) -> WKWebView? {
        // Handle `target=_blank` / `window.open`.
        print("🪟 WalletBridge createWebViewWith called")
        if let url = navigationAction.request.url {
            print("🪟 WalletBridge createWebView URL: \(url.absoluteString)")
            if shouldOpenExternally(url) {
                print("🪟 WalletBridge: Opening new window URL externally")
                openExternally(url)
                return nil
            }

            // If it's a normal web link opened in a new window, keep it in the same webview.
            if navigationAction.targetFrame == nil {
                print("🪟 WalletBridge: Loading in same webview (targetFrame nil)")
                webView.load(URLRequest(url: url))
                return nil
            }
        }

          if let forwardedUIDelegate,
              (forwardedUIDelegate as AnyObject) !== (self as AnyObject) {
            return forwardedUIDelegate.webView?(webView, createWebViewWith: configuration, for: navigationAction, windowFeatures: windowFeatures)
        }

        return nil
    }
}
