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
        guard let schemeRaw = url.scheme?.lowercased() else { return false }

        // Any non-web scheme should be opened by iOS.
        if schemeRaw != "http" && schemeRaw != "https" {
            return externalSchemes.contains(schemeRaw)
        }

        // For wallet universal links, open externally so iOS can trigger the associated app.
        let host = (url.host ?? "").lowercased()
        if host.isEmpty || !hostMatches(host) {
            return false
        }

        let path = url.path.lowercased()
        let query = (url.query ?? "").lowercased()

        // Keep this narrow to wallet-connect style links.
        if path.contains("connect") || path.contains("wc") {
            return true
        }

        if query.contains("uri=") || query.contains("callback=") || query.contains("wc") {
            return true
        }

        return false
    }

    private func openExternally(_ url: URL) {
        DispatchQueue.main.async {
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
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
        }
    }

    func webView(_ webView: WKWebView,
                decidePolicyFor navigationAction: WKNavigationAction,
                decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        if let url = navigationAction.request.url, shouldOpenExternally(url) {
            openExternally(url)
            decisionHandler(.cancel)
            return
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
        if let url = navigationAction.request.url {
            if shouldOpenExternally(url) {
                openExternally(url)
                return nil
            }

            // If it's a normal web link opened in a new window, keep it in the same webview.
            if navigationAction.targetFrame == nil {
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
