import React from 'react';
import Head from 'next/head';

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy - Flunks</title>
        <meta name="description" content="Flunks Privacy Policy" />
      </Head>
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '40px 20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#222',
        backgroundColor: '#fff',
        minHeight: '100vh',
        lineHeight: 1.7,
      }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: '#666', marginBottom: 32 }}>Last updated: February 12, 2026</p>

        <p>
          Flunks (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the Flunks mobile application
          and the <a href="https://flunks.net">flunks.net</a> website (collectively, the &quot;Service&quot;).
          This Privacy Policy explains how we collect, use, and protect your information when you use our Service.
        </p>

        <h2>1. Information We Collect</h2>
        <h3>Information you provide</h3>
        <ul>
          <li><strong>Wallet address</strong> — When you connect a Flow blockchain wallet, we receive your public wallet address to identify your account and display your NFTs.</li>
          <li><strong>Username &amp; profile</strong> — If you create a profile, we store the username and profile icon you choose.</li>
          <li><strong>Feedback &amp; messages</strong> — Any feedback or messages you voluntarily submit through the app.</li>
        </ul>

        <h3>Information collected automatically</h3>
        <ul>
          <li><strong>Device information</strong> — Device type, operating system version, and app version for debugging and compatibility.</li>
          <li><strong>Usage data</strong> — Pages visited, features used, game scores, and in-app actions to improve the experience.</li>
          <li><strong>Local storage</strong> — We use browser local storage and cookies to maintain your session and preferences.</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>Provide, operate, and maintain the Service</li>
          <li>Display your NFT collection and blockchain-based items</li>
          <li>Track in-app rewards (e.g., GUM points, daily check-ins, achievements)</li>
          <li>Manage game leaderboards and competitions</li>
          <li>Improve and personalize the user experience</li>
          <li>Communicate updates or respond to feedback</li>
        </ul>

        <h2>3. Blockchain Data</h2>
        <p>
          Your Flow wallet address and NFT ownership data are publicly available on the Flow blockchain.
          We read this public data to display your collection within the app. We do not control or store
          your private keys and cannot execute transactions on your behalf without your explicit approval
          through your wallet application.
        </p>

        <h2>4. Third-Party Services</h2>
        <p>We use the following third-party services:</p>
        <ul>
          <li><strong>Flow Blockchain</strong> — For NFT and wallet interactions</li>
          <li><strong>WalletConnect</strong> — To facilitate secure wallet connections</li>
          <li><strong>Supabase</strong> — For backend database and authentication services</li>
        </ul>
        <p>These services have their own privacy policies governing their use of your data.</p>

        <h2>5. Data Storage &amp; Security</h2>
        <p>
          We store your data on secure servers and use industry-standard measures to protect it.
          However, no method of electronic transmission or storage is 100% secure, and we cannot
          guarantee absolute security.
        </p>

        <h2>6. Children&apos;s Privacy</h2>
        <p>
          Our Service is not directed to children under 13. We do not knowingly collect personal
          information from children under 13. If you believe we have collected such information,
          please contact us so we can delete it.
        </p>

        <h2>7. Data Retention</h2>
        <p>
          We retain your information for as long as your account is active or as needed to provide
          the Service. You may request deletion of your data by contacting us.
        </p>

        <h2>8. Your Rights</h2>
        <p>Depending on your location, you may have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Request correction or deletion of your data</li>
          <li>Opt out of certain data collection</li>
          <li>Disconnect your wallet at any time to stop data association</li>
        </ul>

        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify users of significant
          changes by posting the updated policy with a new &quot;Last updated&quot; date.
        </p>

        <h2>10. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please reach out to us through
          our community channels or at <a href="https://flunks.net">flunks.net</a>.
        </p>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #eee', color: '#999', fontSize: 14 }}>
          © 2026 Flunks. All rights reserved.
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
