sap.ui.getCore().attachInit(function (startParams) {
    apiGetRequestFiles().then(function (res) {
        modelTabFiles.setData(res);
    });

    // Single field sorting
    const sorter = new sap.ui.model.Sorter("name", true, false);
    const binding = TabFiles.getBinding("items");
    binding.sort(sorter);

    // Some things need to be delayed. Run them inside a timeout
    setTimeout(function () {}, 200);
});
