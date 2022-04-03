let url;
let npTitleId;
let countryLangArray = [];
const titlecontainerUrls = [];
const containerUrls = [];
const resultObj = {};
const storeUrl = "https://store.playstation.com/";

// タイトルIDの取得
function getNpTitleId() {
    const regexNpTitleId = /CUSA\d{5}_\d{2}/;
    npTitleId = url.match(regexNpTitleId)[0];
}

// 国/言語コードの準備
function getCountryLangCode(url) {
    return new Promise(function (resolve) {
        // URLから取得
        const regexLangCountry = /\/[a-zA-Z]{2}-([a-zA-Z]{4}-)?[a-zA-Z]{2}\//;
        if (url.match(regexLangCountry)) {
            let urlLangCountry = url.match(regexLangCountry)[0];
            urlLangCountry = urlLangCountry.replace(/\//g, "");
            let lang = urlLangCountry.slice(0, urlLangCountry.match(/-[a-zA-Z]{2}$/)["index"]);
            let country = urlLangCountry.match(/-[a-zA-Z]{2}$/)[0];
            country = country.replace(/-/, "");
            if (lang == "zh-hant") {
                lang = "ch";
            } else if (lang == "zh-hans") {
                lang = "zh";
            }
            urlCountryLang = country + "/" + lang;
            countryLangArray.push(urlCountryLang);
        }
        // 設定から取得
        chrome.storage.local.get({
            "option": {
                "code0": "ue/en",
                "code1": "jp/ja"
            }
        }, function (obj) {
            const option = obj.option;
            countryLangArray.push(option.code0, option.code1);
            // 重複の除去
            countryLangArray = countryLangArray.filter((cl, i, self) => self.indexOf(cl) === i);
            return resolve();
        });
    })
}

// chihiroのURLを作成
function createChhiroUrls() {
    const chihiroBaseUrl = "https://store.playstation.com/store/api/chihiro/00_09_000/";
    for (const countryLang of countryLangArray) {
        const chihiroUrl1 = chihiroBaseUrl + "titlecontainer/" + countryLang + "/999/" + npTitleId + "?size=0";
        const chihiroUrl2 = chihiroBaseUrl + "container/" + countryLang + "/999/" + npTitleId + "?size=999";
        titlecontainerUrls.push(chihiroUrl1);
        containerUrls.push(chihiroUrl2);
    }
}

// chihiroのjsonからプロダクトIDを取得
async function getChihiroJson() {
    for (const chihiroUrl of titlecontainerUrls) {
        response = await fetch(chihiroUrl).then((response) => {
            return response.json();
        }).catch(e => {
            console.log(e);
        })
        if (response.id) {
            resultObj["id"] = response.id;
            resultObj["url"] = chihiroUrl;
            break;
        }
    }
    if (resultObj["id"]) {
        return;
    }
    for (const chihiroUrl of containerUrls) {
        response = await fetch(chihiroUrl).then((response) => {
            return response.json();
        }).catch(e => {
            console.log(e);
        })
        if (response.links && response.links.length) {
            await getProdIdFromLinksData(response.links, chihiroUrl);
            if (resultObj["id"]) {
                break;
            }
        }
    }
}

// chihiroのlinks配列からプロダクトIDを取得
function getProdIdFromLinksData(links, chihiroUrl) {
    return new Promise(function (resolve) {
        const obj = { "results": [] };
        const categories = ["downloadable_game", "application"];
        for (const link of links) {
            switch (link.top_category) {
                case categories[0]:
                    // ゲーム本編                
                    obj["results"].push({
                        "category": categories[0],
                        "id": link.id,
                        "url": chihiroUrl
                    });
                    break;
                case categories[1]:
                    // YouTube等
                    obj["results"].push({
                        "category": categories[1],
                        "id": link.id,
                        "url": chihiroUrl
                    });
                    break;
            }
        }
        if (obj["results"].length) {
            const getId = category => {
                for (const result of obj["results"]) {
                    if (result["category"] == category) {
                        resultObj["id"] = result["id"];
                        resultObj["url"] = result["url"];
                        break;
                    }
                }
            }
            getId(categories[0]); // downloadable_game を優先する
            if (!resultObj["id"]) getId(categories[1]);
        }
        return resolve();
    })
}

// IDが取得出来た場合に、製品ページのURLを用意してアクセス
function pageTransition() {
    if (Object.keys(resultObj).length > 0) {
        const chihiroUrl = resultObj.url;
        const id = resultObj.id;
        const regexCountryLang = /([a-zA-Z]{2}\/[a-zA-Z]{2})\/999/;
        const countryLang = chihiroUrl.match(regexCountryLang)[1];
        const country = countryLang.split("/")[0];
        let lang = countryLang.split("/")[1];
        if (lang == "ch") {
            lang = "zh-hant";
        } else if (lang == "zh") {
            lang = "zh-hans";
        }
        const langCountry = lang + "-" + country;
        let producUrl = storeUrl + langCountry + "/";
        producUrl = producUrl + "product/" + id;
        window.location = producUrl;
    } else {
        window.location = storeUrl;
    }
}

// 適当なメッセージをService Workerに送ってURLを取得する
chrome.runtime.sendMessage("", function (response) {
    url = response;
    if (url) {
        main();
    }
});

async function main() {
    getNpTitleId();
    await getCountryLangCode(url);
    createChhiroUrls();
    await getChihiroJson();
    pageTransition();
}