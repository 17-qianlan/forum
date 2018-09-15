(() => {
    let oBtn = document.querySelector(".btn");
    if (!oBtn) return;
    let oSpan = oBtn.querySelector("span");
    let max = oSpan.innerHTML.match(/\d+/)[0];
    let page = Math.ceil(max/3);
    //生成ul下的标签
    let oUl = oBtn.querySelector("ul");
    let li = document.createElement("li");
    li.className = "fl";
})();