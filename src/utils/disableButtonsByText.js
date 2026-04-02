function disableButtonsByText(texts = []) {
  const buttons = Array.from(document.querySelectorAll("button"));

  buttons.forEach((btn) => {
    const btnText = btn.textContent.trim().toLowerCase();
    const btnTitle = btn.getAttribute("title")?.toLowerCase() || "";

    texts.forEach((txt) => {
      if (
        btnText.includes(txt.toLowerCase()) ||
        btnTitle.includes(txt.toLowerCase())
      ) {
        console.log(`Disabling: ${btnText || btnTitle}`);
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.style.cursor = "not-allowed";
      }
    });
  });
}
export default disableButtonsByText;
