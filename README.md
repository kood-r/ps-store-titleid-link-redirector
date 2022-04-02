# PS Store TitleID Link Redirector
tidパラメータが使用されたPS StoreのURLにアクセスした場合に、製品ページへのリダイレクトを試みるChromeの拡張機能。

[Chrome ウェブストア](https://chrome.google.com/webstore/detail/ps-store-titleid-link-red/nijnbakfheccdjnodjmhklakaeolicnk)

## 概要
以下のような、2020年10月のPS Storeリニューアル以降に機能しなくなったtidパラメータ付きのURLにアクセスした場合に、製品ページへのリダイレクトを試みる拡張機能です。

[https://store.playstation.com/#!/tid=CUSA00744_00](https://store.playstation.com/#!/tid=CUSA00744_00)

(tidはタイトルIDの略。CUSA形式のIDはPS4のタイトルID)

この形のURLはPS4のシェア機能が生成する物で、現行のPS StoreのAPIはタイトルIDに対応していないため、トップページに飛ばされます。 この拡張機能では、そのようなURLにアクセスした場合に、旧PS StoreやPS4までのPSハードが使用するchihiro APIからプロダクトIDを取得し、製品ページへのリダイレクトを試みます。CUSA形式のIDの場合にのみ動作します。

プロダクトIDが取得出来ない場合は通常と同じようにトップページにリダイレクトします。

プロダクトIDを取得出来た場合でも、購入出来ない製品に関してはリダイレクト先で「購入できません」と表示されます。