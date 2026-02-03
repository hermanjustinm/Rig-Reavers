const navButtons = document.querySelectorAll(".nav button");
const pages = document.querySelectorAll(".page");

const setActivePage = (pageId) => {
  pages.forEach((page) => {
    page.classList.toggle("active", page.dataset.page === pageId);
  });

  navButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === pageId);
  });
};

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActivePage(button.dataset.page);
  });
});

setActivePage("scavenging");
