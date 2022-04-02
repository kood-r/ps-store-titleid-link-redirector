// 国/言語コードの配列
const countryLangArray = [
    "jp/ja", "us/en", "ae/ar", "bh/ar", "kw/ar", "lb/ar", "om/ar", "qa/ar", "sa/ar", "dk/da",
    "at/de", "ch/de", "de/de", "lu/de", "ae/en", "ar/en", "au/en", "bg/en", "bh/en", "br/en",
    "ca/en", "cl/en", "co/en", "cy/en", "cz/en", "dk/en", "fi/en", "gb/en", "gr/en", "hk/en",
    "hr/en", "hu/en", "id/en", "ie/en", "il/en", "in/en", "is/en", "kw/en", "lb/en", "mt/en",
    "mx/en", "my/en", "no/en", "nz/en", "om/en", "pe/en", "pl/en", "qa/en", "ro/en", "sa/en",
    "se/en", "sg/en", "si/en", "sk/en", "th/en", "tr/en", "tw/en", "za/en", "ar/es", "cl/es",
    "co/es", "cr/es", "ec/es", "es/es", "gt/es", "hn/es", "mx/es", "pa/es", "pe/es", "py/es",
    "sv/es", "fi/fi", "be/fr", "ca/fr", "ch/fr", "fr/fr", "lu/fr", "ch/it", "it/it", "kr/ko",
    "be/nl", "nl/nl", "no/no", "pl/pl", "br/pt", "pt/pt", "ru/ru", "ua/ru", "se/sv", "tr/tr",
    "cn/zh", "hk/zh", "hk/ch", "tw/ch"
];

document.addEventListener("DOMContentLoaded", async (e) => {
    await createSelectbox();
    const selects = document.querySelectorAll("select");
    chrome.storage.local.get(null, function (obj) {
        if (obj.option == undefined) {
            resetOptions(selects);
        } else {
            restoreOptions(selects, obj.option);
        }
    });
});

// 国/言語コードのセレクトボックスを2つ作成
function createSelectbox() {
    return new Promise(function (resolve) {
        const li2 = document.querySelectorAll("#code-option-wrapper li");
        li2.forEach((li, index) => {
            const select = document.createElement("select");
            for (const countryLang of countryLangArray) {
                const option = document.createElement("option");
                option.setAttribute("value", countryLang);
                option.text = countryLang;
                select.appendChild(option);
            }
            li.appendChild(select);
            select.setAttribute("id", "code" + index)
        })
        return resolve();
    });
}

// 設定が保存されていない場合 (ページ初回表示時)
function resetOptions(selects) {
    // ブラウザの言語が日本語なら1がjp/ja、2がus/en。日本語以外なら逆にする
    let val0, val1;
    const browserLang = window.navigator.userLanguage || window.navigator.language;
    if (browserLang == "ja-JP" || browserLang == "ja") {
        selects[0].selectedIndex = 0;
        selects[1].selectedIndex = 1;
        val0 = "jp/ja";
        val1 = "us/en";
    } else {
        selects[0].selectedIndex = 1;
        selects[1].selectedIndex = 0;
        val0 = "us/en";
        val1 = "jp/ja";
    }
    const option = {
        "code0": val0,
        "code1": val1
    };
    // 設定の保存
    chrome.storage.local.set({ "option": option });
}

// 設定をページに反映
function restoreOptions(selects, obj) {
    selects.forEach((select, index) => {
        const options = select.querySelectorAll("option");
        for (const option of options) {
            const val = option.getAttribute("value");
            if (index == 0) {
                if (val == obj.code0) {
                    option.selected = true;
                }
            } else {
                if (val == obj.code1) {
                    option.selected = true;
                }
            }
        }
    })
}

// セレクトボックス変更時に設定を保存
document.addEventListener("change", () => {
    const selects = document.querySelectorAll("select");
    const option = {
        "code0": selects[0].selectedOptions[0].value,
        "code1": selects[1].selectedOptions[0].value
    };
    chrome.storage.local.set({ "option": option });
})