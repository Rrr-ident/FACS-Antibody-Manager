console.log("Hello from JavaScript!");

const SUPABASE_URL = "https://vmkuanuetcuowxlqxxrz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_4Bj9nqcwIHQilsFXMoJonQ_SvXI2RTA";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ====================
// 共通データ
// ====================

let antibodies = [];
let panels = [];

let editingAntibody = null;
let editingPanel = null;


// ====================
// HTML要素
// ====================

// 抗体一覧ページ
const table =
    document.getElementById("antibody-table");

const searchInput =
    document.getElementById("search-input");

const colorFilter =
    document.getElementById("color-filter");

const addButton =
    document.getElementById("add-antibody-button");

const addForm =
    document.getElementById("add-form");

const newColor =
    document.getElementById("new-color");

const customColor =
    document.getElementById("custom-color");

const saveButton =
    document.getElementById("save-antibody-button");

const openPanelButton =
    document.getElementById("open-panel-button");


// パネルページ
const panelForm =
    document.getElementById("panel-form");

const panelAntibodyList =
    document.getElementById("panel-antibody-list");

const panelTable =
    document.getElementById("panel-table");

const panelNameInput =
    document.getElementById("panel-name");

const panelAntibodySearch =
    document.getElementById("panel-antibody-search");

const savePanelButton =
    document.getElementById("save-panel-button");

const createPanelButton =
    document.getElementById("create-panel-button");


// ====================
// 抗体データをSupabaseから取得
// ====================

async function loadAntibodies() {

    const { data, error } = await supabaseClient
        .from("antibodies")
        .select("*")
        .order("name", { ascending: true });

    if (error) {
        console.error(
            "抗体データの読み込みエラー:",
            error
        );
        return;
    }

    antibodies = data;

    if (table) {
        displayAntibodies();
    }

    // panel.htmlを開いている場合、
    // 抗体データ取得後にパネル用選択肢にも使える
}


// ====================
// パネルデータをSupabaseから取得
// ====================

async function loadPanels() {

    const { data, error } = await supabaseClient
        .from("panels")
        .select("*")
        .order("name", { ascending: true });

    if (error) {
        console.error(
            "パネルデータの読み込みエラー:",
            error
        );
        return;
    }

    panels = data;

    if (panelTable) {
        displayPanels();
    }
}


// ====================
// 抗体一覧表示
// ====================

function displayAntibodies() {

    if (
        !table ||
        !searchInput ||
        !colorFilter
    ) {
        return;
    }

    const keyword =
        searchInput.value.trim().toLowerCase();

    const selectedColor =
        colorFilter.value;


    const standardColors = [
        "Biotin",
        "BV421",
        "BV510",
        "BV605",
        "FITC",
        "AF488",
        "PerCP-Cy5",
        "PE",
        "PE-Cy5",
        "PE-Cy7",
        "APC",
        "APC-Cy7",
        "AF647",
        "Purified"
    ];


    const filteredAntibodies =
        antibodies

            .filter(function(antibody) {

                const name =
                    antibody.name
                        .toLowerCase();

                const color =
                    antibody.color
                        .toLowerCase();


                const matchesKeyword =
                    name.includes(keyword) ||
                    color.includes(keyword);


                const matchesColor =
                    selectedColor === "" ||

                    antibody.color ===
                        selectedColor ||

                    (
                        selectedColor ===
                            "その他" &&

                        !standardColors.includes(
                            antibody.color
                        )
                    );


                return (
                    matchesKeyword &&
                    matchesColor
                );
            })

            .sort(function(a, b) {

                return a.name.localeCompare(
                    b.name
                );
            });


    table.innerHTML = "";


    filteredAntibodies.forEach(
        function(antibody) {

            const row =
                document.createElement("tr");


            row.innerHTML = `
                <td>${antibody.name}</td>
                <td>${antibody.color}</td>
                <td>${antibody.maker}</td>
                <td>${antibody.catalog}</td>
                <td>${antibody.stock}</td>

                <td>
                    <button
                        type="button"
                        class="edit-button"
                    >
                        編集
                    </button>

                    <button
                        type="button"
                        class="delete-button"
                    >
                        削除
                    </button>
                </td>
            `;


            // 在庫なしを赤字
            if (
                antibody.stock === "なし"
            ) {

                row.classList.add(
                    "out-of-stock"
                );
            }


            // ====================
            // 抗体編集
            // ====================

            const editButton =
                row.querySelector(
                    ".edit-button"
                );


            editButton.addEventListener(
                "click",
                function() {

                    editingAntibody =
                        antibody;


                    document.getElementById(
                        "new-name"
                    ).value =
                        antibody.name;


                    const standardColors = [
                        "Biotin",
                         "BV421",
                         "BV510",
                         "BV605",
                         "FITC",
                         "AF488",
                         "PerCP-Cy5",
                         "PE",
                         "PE-Cy5",
                         "PE-Cy7",
                         "APC",
                         "APC-Cy7",
                         "AF647",
                         "Purified"
                    ];


                    if (
                        standardColors.includes(
                            antibody.color
                        )
                    ) {

                        newColor.value =
                            antibody.color;

                        customColor.style.display =
                            "none";

                        customColor.value = "";

                    } else {

                        newColor.value =
                            "その他";

                        customColor.style.display =
                            "inline-block";

                        customColor.value =
                            antibody.color;
                    }


                    document.getElementById(
                        "new-maker"
                    ).value =
                        antibody.maker;


                    document.getElementById(
                        "new-catalog"
                    ).value =
                        antibody.catalog;


                    document.getElementById(
                        "new-stock"
                    ).value =
                        antibody.stock;


                    saveButton.textContent =
                        "保存";


                    addForm.style.display =
                        "block";
                }
            );


            // ====================
            // 抗体削除
            // ====================

            const deleteButton =
                row.querySelector(
                    ".delete-button"
                );


            deleteButton.addEventListener(
                "click",
                async function() {

                    const { error } =
                        await supabaseClient

                            .from(
                                "antibodies"
                            )

                            .delete()

                            .eq(
                                "id",
                                antibody.id
                            );


                    if (error) {

                        console.error(
                            "抗体削除エラー:",
                            error
                        );

                        alert(
                            "抗体の削除に失敗しました。"
                        );

                        return;
                    }


                    antibodies =
                        antibodies.filter(
                            function(item) {

                                return (
                                    item.id !==
                                    antibody.id
                                );
                            }
                        );


                    displayAntibodies();
                }
            );


            table.appendChild(row);
        }
    );
}


// ====================
// 抗体検索
// ====================

if (
    searchInput &&
    colorFilter
) {

    searchInput.addEventListener(
        "input",
        displayAntibodies
    );


    colorFilter.addEventListener(
        "change",
        displayAntibodies
    );
}


// ====================
// 抗体追加フォームを開く
// ====================

if (
    addButton &&
    addForm
) {

    addButton.addEventListener(
        "click",
        function() {

            editingAntibody = null;

            document.getElementById(
                "new-name"
            ).value = "";

            newColor.value = "";

            customColor.value = "";

            customColor.style.display =
                "none";

            document.getElementById(
                "new-maker"
            ).value = "";

            document.getElementById(
                "new-catalog"
            ).value = "";

            document.getElementById(
                "new-stock"
            ).value = "あり";

            saveButton.textContent =
                "追加";

            addForm.style.display =
                "block";
        }
    );
}


// ====================
// 「その他」の蛍光色
// ====================

if (
    newColor &&
    customColor
) {

    newColor.addEventListener(
        "change",
        function() {

            if (
                newColor.value ===
                "その他"
            ) {

                customColor.style.display =
                    "inline-block";

            } else {

                customColor.style.display =
                    "none";

                customColor.value = "";
            }
        }
    );
}


// ====================
// 抗体追加・編集保存
// ====================

if (saveButton) {

    saveButton.addEventListener(
        "click",
        async function() {

            const selectedColor =
                newColor.value;


            const newAntibody = {

                name:
                    document
                        .getElementById(
                            "new-name"
                        )
                        .value
                        .trim(),

                color:
                    selectedColor ===
                        "その他"

                        ? customColor
                            .value
                            .trim()

                        : selectedColor,

                maker:
                    document
                        .getElementById(
                            "new-maker"
                        )
                        .value
                        .trim(),

                catalog:
                    document
                        .getElementById(
                            "new-catalog"
                        )
                        .value
                        .trim(),

                stock:
                    document
                        .getElementById(
                            "new-stock"
                        )
                        .value
            };


            // ====================
            // 入力チェック
            // ====================

            if (
                newAntibody.name === ""
            ) {

                alert(
                    "抗体名を入力してください。"
                );

                return;
            }


            if (
                newAntibody.color === ""
            ) {

                alert(
                    "蛍光色を選択してください。"
                );

                return;
            }


            if (
                newAntibody.maker === ""
            ) {

                alert(
                    "メーカーを入力してください。"
                );

                return;
            }


            if (
                newAntibody.catalog === ""
            ) {

                alert(
                    "製品番号を入力してください。"
                );

                return;
            }


            // ====================
            // 重複チェック
            // ====================

            const duplicate =
                antibodies.some(
                    function(antibody) {

                        return (
                            antibody.id !==
                                editingAntibody?.id &&

                            antibody.name ===
                                newAntibody.name &&

                            antibody.color ===
                                newAntibody.color &&

                            antibody.maker ===
                                newAntibody.maker &&

                            antibody.catalog ===
                                newAntibody.catalog
                        );
                    }
                );


            if (duplicate) {

                alert(
                    "この抗体はすでに登録されています。"
                );

                return;
            }


            // ====================
            // 新規追加
            // ====================

            if (
                editingAntibody === null
            ) {

                const { data, error } =
                    await supabaseClient

                        .from(
                            "antibodies"
                        )

                        .insert([
                            newAntibody
                        ])

                        .select();


                if (error) {

                    console.error(
                        "抗体追加エラー:",
                        error
                    );

                    alert(
                        "抗体の追加に失敗しました。"
                    );

                    return;
                }


                antibodies.push(
                    data[0]
                );

            } else {

                // ====================
                // 編集
                // ====================

                const { data, error } =
                    await supabaseClient

                        .from(
                            "antibodies"
                        )

                        .update(
                            newAntibody
                        )

                        .eq(
                            "id",
                            editingAntibody.id
                        )

                        .select();


                if (error) {

                    console.error(
                        "抗体編集エラー:",
                        error
                    );

                    alert(
                        "抗体の編集に失敗しました。"
                    );

                    return;
                }


                const updatedAntibody =
                    data[0];


                const index =
                    antibodies.findIndex(
                        function(antibody) {

                            return (
                                antibody.id ===
                                updatedAntibody.id
                            );
                        }
                    );


                if (index !== -1) {

                    antibodies[index] =
                        updatedAntibody;
                }


                editingAntibody = null;

                saveButton.textContent =
                    "追加";
            }


            // 検索条件リセット
            searchInput.value = "";
            colorFilter.value = "";


            // フォームを閉じる
            addForm.style.display =
                "none";


            displayAntibodies();
        }
    );
}


// ====================
// パネルページへ移動
// ====================

if (openPanelButton) {

    openPanelButton.addEventListener(
        "click",
        function() {

            window.location.href =
                "panel.html";
        }
    );
}


// ====================
// パネル選択欄を作成
// ====================

function buildPanelAntibodyList(
    selectedAntibodies = []
) {

    if (!panelAntibodyList) {
        return;
    }

    panelAntibodyList.innerHTML = "";


    // ====================
    // 同じ抗体名＋蛍光色を1つにまとめる
    // ====================

    const uniqueAntibodies = [];

    const seen = new Set();


    antibodies.forEach(
        function(antibody) {

            const key =
                antibody.name
                    .trim()
                    .toLowerCase()
                + "|||"
                + antibody.color
                    .trim()
                    .toLowerCase();


            if (!seen.has(key)) {

                seen.add(key);

                uniqueAntibodies.push(
                    antibody
                );
            }
        }
    );


    // ====================
    // パネル選択欄を作成
    // ====================

    uniqueAntibodies.forEach(
        function(antibody) {

            const item =
                document.createElement("div");

            item.classList.add(
                "panel-antibody-item"
            );


            // 検索用文字列
            item.dataset.search =
                (
                    antibody.name +
                    " " +
                    antibody.color
                ).toLowerCase();


            const label =
                document.createElement(
                    "label"
                );


            label.innerHTML = `
                <input
                    type="checkbox"
                    value="${antibody.id}"
                >
                ${antibody.name}
                (${antibody.color})
            `;


            const checkbox =
                label.querySelector(
                    "input"
                );


            // 編集時に保存済み抗体へチェックを戻す
            const isSelected =
                selectedAntibodies.some(
                    function(
                        selectedAntibody
                    ) {

                        return (
                            selectedAntibody.name ===
                                antibody.name &&

                            selectedAntibody.color ===
                                antibody.color
                        );
                    }
                );


            checkbox.checked =
                isSelected;


            if (
                antibody.stock === "なし"
            ) {

                label.classList.add(
                    "out-of-stock"
                );
            }


            item.appendChild(label);

            panelAntibodyList.appendChild(
                item
            );
        }
    );
}


// ====================
// 新規パネル
// ====================

if (createPanelButton) {

    createPanelButton.addEventListener(
    "click",
    function() {

        editingPanel = null;

        panelNameInput.value = "";

        if (panelAntibodySearch) {
            panelAntibodySearch.value = "";
        }

        buildPanelAntibodyList();

        panelForm.style.display =
            "block";
    }
);

            // ====================
// パネル抗体検索
// ====================

if (panelAntibodySearch) {

    panelAntibodySearch.addEventListener(
        "input",
        function() {

            const keyword =
                panelAntibodySearch
                    .value
                    .trim()
                    .toLowerCase();


            const items =
                panelAntibodyList
                    .querySelectorAll(
                        ".panel-antibody-item"
                    );


            items.forEach(
                function(item) {

                    const searchText =
                        item.dataset.search;


                    if (
                        searchText.includes(
                            keyword
                        )
                    ) {

                        item.style.display =
                            "";

                    } else {

                        item.style.display =
                            "none";
                    }
                }
            );
        }
    );
}
            panelForm.style.display =
                "block";
        }


// ====================
// パネル保存
// ====================

if (
    savePanelButton &&
    panelNameInput &&
    panelAntibodyList
) {

    savePanelButton.addEventListener(
        "click",
        async function() {

            const panelName =
                panelNameInput
                    .value
                    .trim();


            if (panelName === "") {

                alert(
                    "パネル名を入力してください。"
                );

                return;
            }


            const selectedAntibodies =
                [];


            const checkedBoxes =
                panelAntibodyList
                    .querySelectorAll(
                        'input[type="checkbox"]:checked'
                    );


            checkedBoxes.forEach(
                function(checkbox) {

                    const antibodyId =
                        Number(
                            checkbox.value
                        );


                    const antibody =
                        antibodies.find(
                            function(
                                antibody
                            ) {

                                return (
                                    antibody.id ===
                                    antibodyId
                                );
                            }
                        );


                    if (antibody) {

                        // 保存時点のスナップショット
                        selectedAntibodies.push({
                            name:
                                antibody.name,

                            color:
                                antibody.color,

                            maker:
                                antibody.maker,

                            catalog:
                                antibody.catalog,

                            stock:
                                antibody.stock
                        });
                    }
                }
            );


            // ====================
            // 新規パネル
            // ====================

            if (
                editingPanel === null
            ) {

                const newPanel = {

                    name:
                        panelName,

                    antibodies:
                        selectedAntibodies
                };


                const { data, error } =
                    await supabaseClient

                        .from(
                            "panels"
                        )

                        .insert([
                            newPanel
                        ])

                        .select();


                if (error) {

                    console.error(
                        "パネル追加エラー:",
                        error
                    );

                    alert(
                        "パネルの保存に失敗しました。"
                    );

                    return;
                }


                panels.push(
                    data[0]
                );

            } else {

                // ====================
                // パネル編集
                // ====================

                const { data, error } =
                    await supabaseClient

                        .from(
                            "panels"
                        )

                        .update({

                            name:
                                panelName,

                            antibodies:
                                selectedAntibodies
                        })

                        .eq(
                            "id",
                            editingPanel.id
                        )

                        .select();


                if (error) {

                    console.error(
                        "パネル編集エラー:",
                        error
                    );

                    alert(
                        "パネルの編集に失敗しました。"
                    );

                    return;
                }


                const updatedPanel =
                    data[0];


                const index =
                    panels.findIndex(
                        function(panel) {

                            return (
                                panel.id ===
                                updatedPanel.id
                            );
                        }
                    );


                if (index !== -1) {

                    panels[index] =
                        updatedPanel;
                }


                editingPanel = null;
            }


            panelNameInput.value = "";

            panelForm.style.display =
                "none";

            displayPanels();
        }
    );
}


// ====================
// パネル一覧表示
// ====================

function displayPanels() {

    if (!panelTable) {
        return;
    }


    panelTable.innerHTML = "";


    panels.forEach(
        function(panel) {

            const row =
                document.createElement(
                    "tr"
                );


            const antibodyText =
                panel.antibodies
                    .map(
                        function(
                            antibody
                        ) {

                            return (
                                `${antibody.name} ` +
                                `(${antibody.color})`
                            );
                        }
                    )

                    .join("<br>");


            row.innerHTML = `
                <td>
                    ${panel.name}
                </td>

                <td>
                    ${antibodyText}
                </td>

                <td>
                    <button
                        type="button"
                        class="panel-edit-button"
                    >
                        編集
                    </button>

                    <button
                        type="button"
                        class="panel-copy-button"
                    >
                        複製
                    </button>

                    <button
                        type="button"
                        class="panel-delete-button"
                    >
                        削除
                    </button>
                </td>
            `;


            // ====================
            // パネル編集
            // ====================

            const editButton =
                row.querySelector(
                    ".panel-edit-button"
                );


            editButton.addEventListener(
                "click",
                function() {

                    editingPanel =
                        panel;


                    panelNameInput.value =
                        panel.name;

                        if (panelAntibodySearch) {
    panelAntibodySearch.value = "";
}


                    buildPanelAntibodyList(
                        panel.antibodies
                    );


                    panelForm.style.display =
                        "block";
                }
            );


            // ====================
            // パネル複製
            // ====================

            const copyButton =
                row.querySelector(
                    ".panel-copy-button"
                );


            copyButton.addEventListener(
                "click",
                async function() {

                    const copiedPanel = {

                        name:
                            panel.name +
                            "（コピー）",

                        antibodies:
                            panel.antibodies.map(
                                function(
                                    antibody
                                ) {

                                    return {

                                        name:
                                            antibody.name,

                                        color:
                                            antibody.color,

                                        maker:
                                            antibody.maker,

                                        catalog:
                                            antibody.catalog,

                                        stock:
                                            antibody.stock
                                    };
                                }
                            )
                    };


                    const { data, error } =
                        await supabaseClient

                            .from(
                                "panels"
                            )

                            .insert([
                                copiedPanel
                            ])

                            .select();


                    if (error) {

                        console.error(
                            "パネル複製エラー:",
                            error
                        );

                        alert(
                            "パネルの複製に失敗しました。"
                        );

                        return;
                    }


                    panels.push(
                        data[0]
                    );

                    displayPanels();
                }
            );


            // ====================
            // パネル削除
            // ====================

            const deleteButton =
                row.querySelector(
                    ".panel-delete-button"
                );


            deleteButton.addEventListener(
                "click",
                async function() {

                    const { error } =
                        await supabaseClient

                            .from(
                                "panels"
                            )

                            .delete()

                            .eq(
                                "id",
                                panel.id
                            );


                    if (error) {

                        console.error(
                            "パネル削除エラー:",
                            error
                        );

                        alert(
                            "パネルの削除に失敗しました。"
                        );

                        return;
                    }


                    panels =
                        panels.filter(
                            function(item) {

                                return (
                                    item.id !==
                                    panel.id
                                );
                            }
                        );


                    displayPanels();
                }
            );


            panelTable.appendChild(
                row
            );
        }
    );
}


// ====================
// ページ読み込み時
// ====================

async function initializeApp() {

    // まず抗体を取得
    await loadAntibodies();

    // panel.htmlの場合はパネルも取得
    if (panelTable) {
        await loadPanels();
    }
}


initializeApp();
