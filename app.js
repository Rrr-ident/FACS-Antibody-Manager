console.log("Hello from JavaScript!");

// ====================
// 抗体データ
// ====================

const savedAntibodies = localStorage.getItem("antibodies");

const antibodies = savedAntibodies
    ? JSON.parse(savedAntibodies)
    : [
        {
            name: "CD45",
            color: "BV421",
            maker: "BioLegend",
            catalog: "103134",
            stock: "なし"
        },
        {
            name: "CD3",
            color: "APC",
            maker: "BioLegend",
            catalog: "100236",
            stock: "あり"
        },
        {
            name: "CD4",
            color: "PE",
            maker: "BD",
            catalog: "553730",
            stock: "あり"
        },
        {
            name: "CD8a",
            color: "FITC",
            maker: "BioLegend",
            catalog: "100706",
            stock: "あり"
        }
    ];


// ====================
// 抗体一覧
// ====================

const table = document.getElementById("antibody-table");

let editingAntibody = null;

const searchInput = document.getElementById("search-input");
const colorFilter = document.getElementById("color-filter");

function displayAntibodies() {
    const keyword = searchInput.value;
    const selectedColor = colorFilter.value;

    const filteredAntibodies = antibodies
    .filter(function(antibody) {
        const matchesKeyword =
            antibody.name.includes(keyword) ||
            antibody.color.includes(keyword);

        const standardColors = [
    "BV421",
    "APC",
    "PE",
    "FITC",
    "BV510",
    "BV605",
    "BV711",
    "BV786",
    "PerCP-Cy5.5",
    "PE-Cy7",
    "APC-Cy7"
];

const matchesColor =
    selectedColor === "" ||
    antibody.color === selectedColor ||
    (selectedColor === "その他" &&
        !standardColors.includes(antibody.color));

        return matchesKeyword && matchesColor;
    })
    .sort(function(a, b) {
        return a.name.localeCompare(b.name);
    });

    table.innerHTML = "";

    filteredAntibodies.forEach(function(antibody) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${antibody.name}</td>
            <td>${antibody.color}</td>
            <td>${antibody.maker}</td>
            <td>${antibody.catalog}</td>
            <td>${antibody.stock}</td>
            <td>
                <button class="edit-button">編集</button>
                <button class="delete-button">削除</button>
            </td>
        `;

        // 在庫なしを赤字にする
        if (antibody.stock === "なし") {
            row.classList.add("out-of-stock");
        }

        // 削除ボタン
        const deleteButton = row.querySelector(".delete-button");

        deleteButton.addEventListener("click", function() {
            const index = antibodies.indexOf(antibody);

            antibodies.splice(index, 1);

            saveAntibodies();

            displayAntibodies();
        });

        // 編集ボタン
        const editButton = row.querySelector(".edit-button");

        editButton.addEventListener("click", function() {
            editingAntibody = antibody;

            document.getElementById("new-name").value = antibody.name;
            document.getElementById("new-color").value = antibody.color;
            document.getElementById("new-maker").value = antibody.maker;
            document.getElementById("new-catalog").value = antibody.catalog;
            document.getElementById("new-stock").value = antibody.stock;

            document.getElementById("save-antibody-button").textContent = "保存";

            addForm.style.display = "block";
        });

        table.appendChild(row);
    });
}

if (searchInput && colorFilter) {
    searchInput.addEventListener("input", displayAntibodies);
    colorFilter.addEventListener("change", displayAntibodies);

    displayAntibodies();
}


// ====================
// 抗体追加フォーム
// ====================

const addButton = document.getElementById("add-antibody-button");
const addForm = document.getElementById("add-form");

const newColor = document.getElementById("new-color");
const customColor = document.getElementById("custom-color");

if (newColor && customColor) {
    newColor.addEventListener("change", function() {
        if (newColor.value === "その他") {
            customColor.style.display = "inline-block";
        } else {
            customColor.style.display = "none";
            customColor.value = "";
        }
    });
}

if (addButton && addForm) {
    addButton.addEventListener("click", function() {
        addForm.style.display = "block";
    });
}


// ====================
// 抗体の追加・編集保存
// ====================

const saveButton = document.getElementById("save-antibody-button");

if (saveButton) {
    saveButton.addEventListener("click", function() {
    const selectedColor = document.getElementById("new-color").value;

const newAntibody = {
    name: document.getElementById("new-name").value,
    color: selectedColor === "その他"
        ? document.getElementById("custom-color").value
        : selectedColor,
    maker: document.getElementById("new-maker").value,
    catalog: document.getElementById("new-catalog").value,
    stock: document.getElementById("new-stock").value
};
    if (newAntibody.name === "") {
    alert("抗体名を入力してください。");
    return;
}

if (newAntibody.color === "") {
    alert("蛍光色を選択してください。");
    return;
}

if (newAntibody.maker === "") {
    alert("メーカーを入力してください。");
    return;
}

if (newAntibody.catalog === "") {
    alert("カタログ番号を入力してください。");
    return;
}
const duplicate = antibodies.some(function(antibody) {
    return (
        antibody !== editingAntibody &&
            antibody.name === newAntibody.name &&
            antibody.color === newAntibody.color &&
            antibody.maker === newAntibody.maker &&
            antibody.catalog === newAntibody.catalog
        );
    });

    if (duplicate) {
        alert("この抗体はすでに登録されています。");
        return;
    }

    if (editingAntibody === null) {

        // 新規追加
        antibodies.push(newAntibody);

    } else {

        // 編集
        editingAntibody.name = newAntibody.name;
        editingAntibody.color = newAntibody.color;
        editingAntibody.maker = newAntibody.maker;
        editingAntibody.catalog = newAntibody.catalog;
        editingAntibody.stock = newAntibody.stock;

        editingAntibody = null;

        saveButton.textContent = "追加";
    }

    saveAntibodies();

    // 検索条件をリセット
    searchInput.value = "";
    colorFilter.value = "";

    // フォームを閉じる
    addForm.style.display = "none";

    // 一覧を更新
    displayAntibodies();
});
}


// ====================
// 抗体をlocalStorageに保存
// ====================

function saveAntibodies() {
    localStorage.setItem("antibodies", JSON.stringify(antibodies));
}


// ====================
// パネル
// ====================

const openPanelButton =
    document.getElementById("open-panel-button");

if (openPanelButton) {
    openPanelButton.addEventListener("click", function() {
        window.location.href = "panel.html";
    });
}
const panelForm = document.getElementById("panel-form");
const panelAntibodyList = document.getElementById("panel-antibody-list");

const panelTable = document.getElementById("panel-table");
const panelNameInput = document.getElementById("panel-name");
const savePanelButton = document.getElementById("save-panel-button");


// ====================
// パネルデータをlocalStorageから読み込む
// ====================

const savedPanels = localStorage.getItem("panels");

const panels = savedPanels
    ? JSON.parse(savedPanels)
    : [];

    let editingPanel = null;

// ====================
// パネル新規作成
// ====================

const createPanelButton =
    document.getElementById("create-panel-button");

if (createPanelButton) {

    createPanelButton.addEventListener("click", function() {

        // 新規作成なので編集状態を解除
        editingPanel = null;

        // パネル名を空にする
        panelNameInput.value = "";

        // 抗体選択欄を作り直す
        panelAntibodyList.innerHTML = "";

        antibodies.forEach(function(antibody) {

            const label = document.createElement("label");

            label.innerHTML = `
                <input type="checkbox" value="${antibody.name}">
                ${antibody.name} (${antibody.color})
            `;

            // 在庫なしを赤字にする
            if (antibody.stock === "なし") {
                label.classList.add("out-of-stock");
            }

            panelAntibodyList.appendChild(label);

            panelAntibodyList.appendChild(
                document.createElement("br")
            );
        });

        // フォームを表示
        panelForm.style.display = "block";
    });
}

// ====================
// パネル保存
// ====================

savePanelButton.addEventListener("click", function() {

    const panelName = panelNameInput.value;

    const selectedAntibodies = [];

    const checkedBoxes =
        panelAntibodyList.querySelectorAll(
            'input[type="checkbox"]:checked'
        );

    checkedBoxes.forEach(function(checkbox) {

        const antibody = antibodies.find(function(antibody) {
            return antibody.name === checkbox.value;
        });

        if (antibody) {
            selectedAntibodies.push(antibody);
        }
    });

    if (editingPanel === null) {

    // 新規パネル
    panels.push({
        name: panelName,
        antibodies: selectedAntibodies
    });

} else {

    // 既存パネルを編集
    editingPanel.name = panelName;
    editingPanel.antibodies = selectedAntibodies;

    // 編集終了
    editingPanel = null;
}

    // localStorageに保存
    localStorage.setItem(
        "panels",
        JSON.stringify(panels)
    );

    // 入力欄をリセット
    panelNameInput.value = "";

    // チェックを外す
    checkedBoxes.forEach(function(checkbox) {
        checkbox.checked = false;
    });

    // フォームを閉じる
    panelForm.style.display = "none";

    // パネル一覧を更新
    displayPanels();
});


// ====================
// パネル一覧表示
// ====================

function displayPanels() {

    if (!panelTable) {
        return;
    }

    panelTable.innerHTML = "";

    panels.forEach(function(panel) {

        const row = document.createElement("tr");

        const antibodyText = panel.antibodies
            .map(function(antibody) {
                return `${antibody.name} (${antibody.color})`;
            })
            .join("<br>");

        row.innerHTML = `
            <td>${panel.name}</td>
            <td>${antibodyText}</td>
            <td>
                <button type="button" class="panel-edit-button">編集</button>
                <button type="button" class="panel-copy-button">複製</button>
                <button type="button" class="panel-delete-button">削除</button>
            </td>
        `;
        // 複製ボタン
const copyButton =
    row.querySelector(".panel-copy-button");

copyButton.addEventListener("click", function() {

    const copiedPanel = {
        name: panel.name + "（コピー）",
        antibodies: panel.antibodies.map(function(antibody) {
            return {
                name: antibody.name,
                color: antibody.color,
                maker: antibody.maker,
                catalog: antibody.catalog,
                stock: antibody.stock
            };
        })
    };

    panels.push(copiedPanel);

    // localStorageに保存
    localStorage.setItem(
        "panels",
        JSON.stringify(panels)
    );

    // パネル一覧を更新
    displayPanels();
});
// 編集ボタン
const editButton =
    row.querySelector(".panel-edit-button");

editButton.addEventListener("click", function() {

    editingPanel = panel;

    // パネル名をフォームに入れる
    panelNameInput.value = panel.name;

    // 抗体選択欄を作り直す
    panelAntibodyList.innerHTML = "";

    antibodies.forEach(function(antibody) {

        const label = document.createElement("label");

        label.innerHTML = `
            <input type="checkbox" value="${antibody.name}">
            ${antibody.name} (${antibody.color})
        `;

        // すでにパネルに入っている抗体ならチェック
        const isSelected = panel.antibodies.some(function(selectedAntibody) {
    return (
        selectedAntibody.name === antibody.name &&
        selectedAntibody.color === antibody.color
    );
});

        if (isSelected) {
            label.querySelector("input").checked = true;
        }

        // 在庫なしを赤字にする
        if (antibody.stock === "なし") {
            label.classList.add("out-of-stock");
        }

        panelAntibodyList.appendChild(label);
        panelAntibodyList.appendChild(
            document.createElement("br")
        );
    });

    // フォームを表示
    panelForm.style.display = "block";
});
        // 削除ボタン
        const deleteButton =
            row.querySelector(".panel-delete-button");

        deleteButton.addEventListener("click", function() {

            const index = panels.indexOf(panel);

            panels.splice(index, 1);

            // localStorageに保存
            localStorage.setItem(
                "panels",
                JSON.stringify(panels)
            );

            // パネル一覧を更新
            displayPanels();
        });

        panelTable.appendChild(row);
    });
}


// ====================
// ページ読み込み時にパネルを表示
// ====================

displayPanels();