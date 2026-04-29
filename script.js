function predict() {
    let ret = parseFloat(document.getElementById("return").value);
    let ma5 = parseFloat(document.getElementById("ma5").value);
    let ma10 = parseFloat(document.getElementById("ma10").value);
    let vol = parseFloat(document.getElementById("volatility").value);

    let resultDiv = document.getElementById("result");

    if (isNaN(ret) || isNaN(ma5) || isNaN(ma10) || isNaN(vol)) {
        resultDiv.innerHTML = "⚠️ Please enter all values";
        return;
    }

    // Simple logic (demo version of ML)
    if (ret > 0 && ma5 > ma10 && vol < 0.05) {
        resultDiv.innerHTML = "📈 Prediction: STOCK WILL GO UP";
        resultDiv.style.color = "#00ff99";
    } else {
        resultDiv.innerHTML = "📉 Prediction: STOCK WILL GO DOWN";
        resultDiv.style.color = "#ff6666";
    }
}
