let url;

// 対象のURLを変数に格納
chrome.webNavigation.onBeforeNavigate.addListener(function (e) {
    const regexUrl = /^(https?:\/\/store.playstation.com\/#!\/)([a-zA-Z]{2}-([a-zA-Z]{4}-)?[a-zA-Z]{2}\/)?tid=(CUSA\d{5}_\d{2}).*/;
    if (e.url.match(regexUrl)) {
        url = e.url;
    }
}, { url: [{ hostEquals: "store.playstation.com" }] });

// リダイレクト先のjs(redirect.js)からメッセージが来たらURLを返す
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    console.log(msg, url);
    sendResponse(url);
    return true;
})

// インストール時や更新時に設定を確認
chrome.runtime.onInstalled.addListener(function () {
    checkOptions();
});

function checkOptions() {
    chrome.storage.local.get("option", function (obj) {
        if(obj.option == undefined){
            // 存在しない場合はオプションページを開く (初回は設定の保存が行われる)
            chrome.tabs.create({ url: "option.html", active: true });
        }
    })
}