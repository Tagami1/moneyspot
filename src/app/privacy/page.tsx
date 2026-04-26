export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif', lineHeight: 1.7, color: '#1f2937' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>プライバシーポリシー / Privacy Policy</h1>
      <p style={{ color: '#6b7280', marginBottom: 32 }}>最終更新日 / Last updated: 2026-04-21</p>

      <p>MoneySpot（以下「本アプリ」）は、ユーザーのプライバシーを尊重し、個人情報の適切な管理に努めます。</p>
      <p>MoneySpot ("the App") respects user privacy and is committed to properly managing personal information.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>1. 収集する情報 / Information We Collect</h2>
      <ul style={{ paddingLeft: 20 }}>
        <li><strong>メールアドレス：</strong>ログイン時にワンタイムパスワード（OTP）を送信するために使用します。</li>
        <li><strong>Email address:</strong> Used to send a one-time password (OTP) for login authentication.</li>
        <li><strong>匿名ユーザーID：</strong>アプリ起動時に自動生成される識別子（Supabase匿名認証）。</li>
        <li><strong>Anonymous user ID:</strong> Automatically generated identifier upon app launch (Supabase anonymous auth).</li>
        <li><strong>お気に入り情報：</strong>ユーザーが登録した両替所のお気に入りリスト。</li>
        <li><strong>Favorites:</strong> List of currency exchange shops saved by the user.</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>2. 情報の利用目的 / How We Use Information</h2>
      <ul style={{ paddingLeft: 20 }}>
        <li>アプリ機能の提供（両替レートの表示、お気に入り管理など）</li>
        <li>Providing app features (exchange rate display, favorites management, etc.)</li>
        <li>OTPメール送信によるログイン認証</li>
        <li>Login authentication via OTP email</li>
        <li>サービス改善のための匿名データ分析</li>
        <li>Anonymous data analysis for service improvement</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>3. 第三者への提供 / Third-Party Sharing</h2>
      <p>本アプリは、以下の場合を除きユーザーの個人情報を第三者に提供しません。</p>
      <p>We do not share personal information with third parties except in the following cases:</p>
      <ul style={{ paddingLeft: 20 }}>
        <li>法令に基づく開示が必要な場合 / When disclosure is required by law</li>
        <li>ユーザーの同意がある場合 / With user consent</li>
      </ul>
      <p style={{ marginTop: 12 }}>データ保管には <strong>Supabase</strong>（米国）を使用しています。</p>
      <p>Data is stored using <strong>Supabase</strong> (US).</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>4. データの保持期間 / Data Retention</h2>
      <p>メールアドレスおよびアカウント情報は、アカウント削除リクエストを受け取ってから <strong>30日以内</strong>に削除します。</p>
      <p>Email addresses and account information will be deleted within <strong>30 days</strong> of receiving an account deletion request.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>5. アカウントの削除 / Account Deletion</h2>
      <p>アカウントおよびデータの削除をご希望の方は、以下のページよりリクエストしてください。</p>
      <p>To request deletion of your account and data, please visit the following page:</p>
      <p style={{ marginTop: 8 }}>
        <a href="/delete-account" style={{ color: '#2563eb', textDecoration: 'underline' }}>
          アカウント削除のリクエスト / Request Account Deletion →
        </a>
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>6. お問い合わせ / Contact</h2>
      <p>プライバシーに関するご質問は下記までご連絡ください。</p>
      <p>For privacy-related inquiries, please contact us at:</p>
      <p style={{ marginTop: 8 }}>
        <a href="mailto:support@moneyspot.money" style={{ color: '#2563eb' }}>support@moneyspot.money</a>
      </p>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #e5e7eb', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
        <p>© 2026 MoneySpot. All rights reserved.</p>
        <p><a href="/" style={{ color: '#6b7280' }}>← MoneySpot トップ</a></p>
      </div>
    </div>
  );
}
