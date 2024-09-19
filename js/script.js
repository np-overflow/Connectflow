document.getElementById("play-btn").addEventListener("click", () => {
  const initialButtons = document.getElementById("initial-buttons");
  const difficultyButtons = document.getElementById("difficulty-buttons");

  // Hide the initial buttons
  initialButtons.style.opacity = 0;

  // After transition, display difficulty buttons
  setTimeout(() => {
    initialButtons.classList.add("d-none");
    difficultyButtons.classList.remove("d-none");
    difficultyButtons.style.opacity = 1;
  }, 500);
});

const difficultyButtons = document.querySelectorAll("#difficulty-buttons .btn");
difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const difficulty = button.textContent.toLowerCase();
    localStorage.setItem("selectedDifficulty", difficulty);
    window.location.href = "game.html";
  });
});
