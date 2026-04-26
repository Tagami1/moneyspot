export default function DeleteAccountPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif', lineHeight: 1.7, color: '#1f2937' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>アカウント削除のリクエスト</h1>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: '#374151', marginBottom: 32 }}>Request Account Deletion</h2>

      <div style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 8, padding: '16px 20px', marginBottom: 32 }}>
        <p style={{ margin: 0, fontWeight: 600 }}>MoneySpot アカウントの削除をご希望の場合</p>
        <p style={{ margin: '4px 0 0', color: '#92400e' }}>To delete your MoneySpot account, please follow the steps below.</p>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>削除方法 / How to Delete</h2>
      
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '20px', marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#1d4ed8' }}>メールでのリクエスト / Email Request</h3>
        <ol style={{ paddingLeft: 20, margin: 0 }}>
          <li style={{ marginBottom: 8 }}>下記のメールアドレスにメールを送信してください。</li>
          <li style={{ marginBottom: 8 }}>件名：「アカウント削除のリクエスト」または「Account Deletion Request」</li>
          <li style={{ marginBottom: 8 }}>本文：アプリに登録したメールアドレスをご記入ください。</li>
        </ol>
        <p style={{ marginTop: 16, marginBottom: 4 }}>
          <a href="mailto:support@moneyspot.money?subject=アカウント削除のリクエスト&body=削除を希望するメールアドレス：" 
             style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, display: 'inline-block' }}>
            📧 削除リクエストメールを送る
          </a>
        </p>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 12 }}>
          宛先 / To: <strong>support@moneyspot.money</strong>
        </p>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 16 }}>削除されるデータ / Data That Will Be Deleted</h2>
      <ul style={{ paddingLeft: 20 }}>
        <li>アカウント情報（メールアドレス、ユーザーID）/ Account information (email address, user ID)</li>
        <li>お気に入りの両替所リスト / Saved favorite exchange shops</li>
        <li>アプリ設定（表示通貨、言語設定など）/ App settings (display currency, language, etc.)</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>データ保持について / Data Retention</h2>
      <p>削除リクエスト受領後、<strong>30日以内</strong>にすべてのアカウントデータを削除します。</p>
      <p>All account data will be deleted within <strong>30 days</strong> of receiving your deletion request.</p>
      <p style={{ marginTop: 12 }}>なお、法令上の義務により一部のデータが一定期間保持される場合があります。</p>
      <p>Please note that some data may be retained for a period of time due to legal obligations.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>部分的なデータ削除 / Partial Data Deletion</h2>
      <p>アカウントを削除せずに特定のデータのみ削除したい場合も、上記メールアドレスにご連絡ください。対応可能なデータの種類をご案内します。</p>
      <p>If you wish to delete only specific data without deleting your account, please contact us at the email above. We will advise on the types of data that can be deleted.</p>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #e5e7eb', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
        <p>
          <a href="/privacy" style={{ color: '#6b7280', marginRight: 16 }}>プライバシーポリシー</a>
          <a href="/" style={{ color: '#6b7280' }}>← MoneySpot トップ</a>
        </p>
        <p style={{ marginTop: 8 }}>© 2026 MoneySpot. All rights reserved.</p>
      </div>
    </div>
  );
}
