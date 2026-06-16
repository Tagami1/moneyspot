import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "MoneySpot Privacy Policy - How we handle your data",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: April 17, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8">
          {/* English Version */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">English</h2>

            <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1. Introduction</h3>
                <p>
                  MoneySpot (&quot;we&quot;, &quot;our&quot;, or &quot;the App&quot;) is developed and operated by Yuto Tagami.
                  This Privacy Policy explains how we collect, use, and protect your information when you use MoneySpot
                  (Bundle ID: com.moneyspot.app). By using the App, you agree to the practices described in this policy.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2. Information We Collect</h3>

                <h4 className="font-medium text-gray-800 mt-3 mb-1">2.1 Location Data</h4>
                <p>
                  We request access to your device&apos;s location to find nearby currency exchange shops.
                  Location data is used only in real-time to display relevant results and is not stored on our servers.
                  If you deny location permission, the App defaults to Tokyo Station as a reference point.
                </p>

                <h4 className="font-medium text-gray-800 mt-3 mb-1">2.2 Favorites and Preferences</h4>
                <p>
                  Your favorite shops and app preferences are stored locally on your device using AsyncStorage.
                  If you are signed in, favorites may be synced with our backend (Supabase) to provide a consistent
                  experience across sessions.
                </p>

                <h4 className="font-medium text-gray-800 mt-3 mb-1">2.3 Anonymous Authentication</h4>
                <p>
                  The App uses Supabase anonymous authentication to enable features such as favorite syncing
                  and usage analytics. This generates a random user ID that is not linked to any personally
                  identifiable information (name, email, phone number, etc.) unless you explicitly provide it.
                </p>

                <h4 className="font-medium text-gray-800 mt-3 mb-1">2.4 Usage Analytics</h4>
                <p>
                  We may collect anonymous usage data (e.g., which currencies are viewed, feature usage patterns)
                  to improve the App. This data cannot be used to identify individual users.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3. Third-Party Services</h3>
                <p>The App uses the following third-party services:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>
                    <strong>Supabase</strong> &mdash; Backend database and authentication.
                    See <a href="https://supabase.com/privacy" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Supabase Privacy Policy</a>.
                  </li>
                  <li>
                    <strong>open.er-api.com</strong> &mdash; Exchange rate data provider. No personal data is sent to this service.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">4. Data Sharing</h3>
                <p>
                  We do not sell, trade, or share your personal information with third parties.
                  Data is only shared with the third-party services listed above to the extent necessary
                  to provide the App&apos;s functionality.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5. Advertising and In-App Purchases</h3>
                <p>
                  The App currently does not display advertisements or offer in-app purchases.
                  If these features are introduced in the future, this Privacy Policy will be updated accordingly.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">6. Data Security</h3>
                <p>
                  We implement reasonable security measures to protect the data handled by the App.
                  However, no method of electronic transmission or storage is 100% secure, and we cannot
                  guarantee absolute security.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">7. Children&apos;s Privacy</h3>
                <p>
                  The App is not directed at children under 13 years of age. We do not knowingly collect
                  personal information from children under 13.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">8. Changes to This Policy</h3>
                <p>
                  We may update this Privacy Policy from time to time. Changes will be posted on this page
                  with an updated &quot;Last updated&quot; date. Continued use of the App after changes constitutes
                  acceptance of the updated policy.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">9. Contact Us</h3>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <p className="mt-1">
                  <strong>Developer:</strong> Yuto Tagami<br />
                  <strong>Email:</strong> tagami@moneyspot.money
                </p>
              </div>
            </div>
          </section>

          {/* Divider */}
          <hr className="border-gray-300 my-10" />

          {/* Japanese Version */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">日本語</h2>

            <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1. はじめに</h3>
                <p>
                  MoneySpot（以下「本アプリ」）は、田上雄斗が開発・運営しています。
                  本プライバシーポリシーは、MoneySpot（バンドルID: com.moneyspot.app）をご利用いただく際の
                  情報の収集、利用、保護について説明するものです。
                  本アプリをご利用いただくことで、本ポリシーに記載された内容に同意したものとみなされます。
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2. 収集する情報</h3>

                <h4 className="font-medium text-gray-800 mt-3 mb-1">2.1 位置情報</h4>
                <p>
                  近くの両替所を検索するため、端末の位置情報へのアクセスを要求します。
                  位置情報はリアルタイムでの検索表示にのみ使用され、当社サーバーには保存されません。
                  位置情報の許可を拒否した場合、東京駅を基準地点として使用します。
                </p>

                <h4 className="font-medium text-gray-800 mt-3 mb-1">2.2 お気に入り・設定情報</h4>
                <p>
                  お気に入りの両替所やアプリの設定は、AsyncStorageを使用して端末内にローカル保存されます。
                  サインインしている場合、お気に入り情報はバックエンド（Supabase）と同期され、
                  セッション間で一貫した体験を提供します。
                </p>

                <h4 className="font-medium text-gray-800 mt-3 mb-1">2.3 匿名認証</h4>
                <p>
                  本アプリは、お気に入りの同期や利用状況分析などの機能を提供するために、
                  Supabaseの匿名認証を使用しています。これにより生成されるランダムなユーザーIDは、
                  お客様が明示的に提供しない限り、個人を特定できる情報（氏名、メールアドレス、電話番号等）
                  とは紐付けられません。
                </p>

                <h4 className="font-medium text-gray-800 mt-3 mb-1">2.4 利用状況分析</h4>
                <p>
                  アプリの改善のため、匿名の利用データ（閲覧通貨、機能の使用パターン等）を
                  収集する場合があります。このデータは個人を特定するために使用されることはありません。
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3. 第三者サービス</h3>
                <p>本アプリは以下の第三者サービスを利用しています：</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>
                    <strong>Supabase</strong> &mdash; バックエンドデータベースおよび認証。
                    <a href="https://supabase.com/privacy" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Supabaseプライバシーポリシー</a>をご参照ください。
                  </li>
                  <li>
                    <strong>open.er-api.com</strong> &mdash; 為替レートデータの提供元。個人データはこのサービスに送信されません。
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">4. データの共有</h3>
                <p>
                  お客様の個人情報を第三者に販売、取引、共有することはありません。
                  データは、本アプリの機能を提供するために必要な範囲でのみ、
                  上記の第三者サービスと共有されます。
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5. 広告およびアプリ内課金</h3>
                <p>
                  現在、本アプリには広告の表示やアプリ内課金の機能はありません。
                  将来これらの機能が導入される場合、本プライバシーポリシーを更新いたします。
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">6. データセキュリティ</h3>
                <p>
                  本アプリで取り扱うデータを保護するため、合理的なセキュリティ対策を実施しています。
                  ただし、電子的な送信や保存の方法に100%安全なものはなく、
                  絶対的なセキュリティを保証することはできません。
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">7. お子様のプライバシー</h3>
                <p>
                  本アプリは13歳未満のお子様を対象としたものではありません。
                  13歳未満のお子様から意図的に個人情報を収集することはありません。
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">8. 本ポリシーの変更</h3>
                <p>
                  本プライバシーポリシーは随時更新される場合があります。
                  変更は本ページに掲載され、「最終更新日」が更新されます。
                  変更後も本アプリを継続して利用することで、更新されたポリシーに同意したものとみなされます。
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">9. お問い合わせ</h3>
                <p>
                  本プライバシーポリシーに関するご質問は、以下までお問い合わせください：
                </p>
                <p className="mt-1">
                  <strong>開発者：</strong>田上雄斗<br />
                  <strong>メール：</strong>tagami@moneyspot.money
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 text-center">
          <a href="/" className="text-blue-600 text-sm hover:underline">
            &larr; Back to MoneySpot / MoneySpotに戻る
          </a>
        </div>
      </div>
    </div>
  );
}
