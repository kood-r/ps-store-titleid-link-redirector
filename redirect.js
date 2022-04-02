let url;
let npTitleId;
let countryLangArray = [];
const chihiroUrls = [];
const successInfo = {};

// 適当なメッセージをService Workerに送ってURLを取得する
chrome.runtime.sendMessage("", function (response) {
    url = response;
    if (url) {
        main();
    }
});

// タイトルIDの取得
function getNpTitleId(){
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
            "option":{
                "code0": "ue/en",
                "code1": "jp/ja"
            }
        }, function (obj) {
            const option = obj.option;
            countryLangArray.push(option.code0, option.code1);
            // 重複の除去
            countryLangArray = countryLangArray.filter((cl, i, self) =>  self.indexOf(cl) === i);
            return resolve();
        });
    })
}

// chihiroのURLを作成
function createChhiroUrls(){
    for(const countryLang of countryLangArray){
        let chihiroUrl = "https://store.playstation.com/store/api/chihiro/00_09_000/titlecontainer/";
        chihiroUrl = chihiroUrl + countryLang + "/999/" + npTitleId + "?size=0";
        chihiroUrls.push(chihiroUrl);
    }
}

// chihiroのjsonからIDを取得
async function getChihiroJson(){
    for(const chihiroUrl of chihiroUrls){
        response = await fetch(chihiroUrl).then((response) => {
            return response.json();
        }).catch((e) => {
            console.log(e);
        })
        if(response.id){
            successInfo["id"] = response.id;
            successInfo["url"] = chihiroUrl;
            break;
        }
    }
}

// IDが取得出来た場合に、製品ページのURLを用意してアクセス
function pageTransition(){
    if(Object.keys(successInfo).length > 0){
        const chihiroUrl = successInfo.url;
        const id = successInfo.id;
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
        let producUrl = "https://store.playstation.com/" + langCountry + "/";
        producUrl = producUrl + "product/"  + id;
        window.location = producUrl;
    }else{
        window.location = "https://store.playstation.com/";
    }
}

async function main(){
    getNpTitleId();
    await getCountryLangCode(url);
    createChhiroUrls();
    await getChihiroJson();
    pageTransition();
}