## サービス概要
サービスURL：https://app.pdfsync.tech/  
  
リアル会議の効率化を目的としたWebアプリケーションです。  
主な機能は、**PDFページ同期、チャット、個人メモ機能** から構成されます。  
アカウント登録不要で、メールアドレスのみで使用可能です。  
  
[![トップページ](https://i.gyazo.com/4b35a8c5f9d29a9201f06f9ce4c25d98.png)](https://gyazo.com/4b35a8c5f9d29a9201f06f9ce4c25d98)
  
  
## 開発背景
前職で導入していた会議システムに搭載されていた、  
「発表者がページをめくると全員の画面が同期する」という機能が便利で、  
自分でも作ってみたいと考えたことが開発のきっかけです。  
  
本アプリでは、PDFページ同期に加えて、リアルタイムチャットや  
メモのAI整形機能を実装し、リアル会議での議論・情報共有を  
スムーズにするツールとして設計しました。  
  
  
## 使用想定場面
- リアル会議  
- イベント / セミナー  
- 勉強会 / 打ち合わせ  
- 教育・講習系  
  
  
## 主な機能
  
 ### 認証
 - メールに記載の URL からパスワードを設定し、PDFアップロード・閲覧画面へアクセス  
 - パスワード再設定機能  

 ### 資料のアップロード / 削除
 - AWS S3 へのダイレクトアップロード（Active Storage 利用）  

 ### PDFページ同期
 - 発表者が資料をページ送りすると、聴講者の画面がリアルタイムに同期  

 ### チャット
 - 匿名チャット機能  
 - 各メッセージに対する「いいね」機能  

 ### メモ
 - 個人メモ機能  
 - メモの文章を AI（OpenAI）で整形  

 ### PDF閲覧関連
 - PDFページ送り  
 - 拡大 / 縮小  
 - フルスクリーン表示  
 - タブレット端末でのスワイプ操作（フルスクリーン時）  
 - PDFダウンロード  
 - ブラウザ標準ビューアでのPDF表示  
  
  
## PDF閲覧画面の機能
[![PDF閲覧画面](https://i.gyazo.com/fb14d85d15f4c52efda103dee732af84.png)](https://gyazo.com/fb14d85d15f4c52efda103dee732af84)  
この画面は、発表者と聴講者が共有する **PDF閲覧用のメイン画面** です。  
上部には **操作用のコントロールバー** があり、PDF同期、チャット、メモなど、各機能のボタンが並んでいます。  
発表者がページを送ると、聴講者の画面もリアルタイムに同期し、同じ資料を見ながら議論できます。  
以下は **コントロールバーの各ボタンの説明** です。  
  
[![各ボタンの説明](https://i.gyazo.com/d42aa849d94c25f662372229caa8babd.png)](https://gyazo.com/d42aa849d94c25f662372229caa8babd)  
  
  
## 技術構成
| カテゴリ | 技術 |
| :--- | :--- |
| バックエンド | Ruby 3.3.6 / Ruby on Rails 7.2.3 |
| フロントエンド | Stimulus 3.2.2 / React 19.2.0 / Typescript 5.9.3 |
| CSSフレームワーク | Tailwind CSS 3.4.17 + daisyUI 5.5.5 |
| データベース | PostgreSQL 18.1 |
| ファイルサーバー | AWS S3 |
| デプロイ | AWS EC2 |
| CI/CD | Github Actions |
  
  
## 技術選定理由

### バックエンド
- **Ruby on Rails**  
  - 開発効率を重視  

### フロントエンド
- **Stimulus**（PDFアップロード画面）  
  - PDFアップロード画面については、Active Storage のダイレクトアップロードは Rails フォームビューと  
  密接に結びついているため、Railsビューに自然に統合できる Stimulus を採用  

- **React**（PDF閲覧画面）  
  - PDF閲覧画面については、リアルタイム機能（PDF同期・チャット）、メモ機能、フルスクリーン、拡大・縮小、ページ送りなど、１ページ内に管理すべき状態が多いため、Reactを採用  
  - RailsのビューにReactをマウント

### CSSフレームワーク
- **Tailwindcss + daisyUI**  
  - デザインの一貫性を保ちつつ、開発スピードを向上  
  - daisyUIでUIコンポーネントを効率的に利用（モーダルなど）  

### データベース
- **PostgreSQL**  
  - Railsとの相性が良い  

### ファイルサーバー
- **AWS S3**  
  - Active Storageとの統合が容易  

### デプロイ
- **AWS EC2**  
  - AWSの中ではコストを抑えられるため採用  
  - EC2 上に Rails / PostgreSQL / Redis / Nginx を構築  
  - GithubActionsによるCDを実装し、mainブランチへのマージ時にはDockerイメージをAWS ECRにプッシュしてEC2に自動デプロイ  
  
  
## セキュリティ
- パスワード生成ページURL（トークン）の有効期限設定（1時間）
- パスワードハッシュ化（has_secure_password、bcrypt）
- 資料格納・閲覧ページのパスワード認証、有効期限設定（2週間）
- レート制限（Rack::Attack）
  
  
## ER図
[![ER図](https://i.gyazo.com/e6b5ad025733f1393a4e230b1c722e0a.png)](https://gyazo.com/e6b5ad025733f1393a4e230b1c722e0a)
  
  
## 画面遷移図
[画面遷移図（Figmaへのリンク）](https://www.figma.com/design/hEMEl2NMbi86g6tvFbVLcY/%E7%94%BB%E9%9D%A2%E9%81%B7%E7%A7%BB%E5%9B%B3?node-id=0-1&p=f&t=eId5hsnLZXJZyMQ5-0)
