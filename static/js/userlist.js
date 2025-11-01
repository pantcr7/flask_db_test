lucide.createIcons();

document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.querySelector('button.bg-blue-600');
  const modal = document.getElementById('addUserModal');
  const closeModal = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const form = document.getElementById('addUserForm');
  const messageBox = document.getElementById("formMessage");

  // Show modal
  addBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
  });

  // Hide modal
  [closeModal, cancelBtn].forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    console.log(data,'data')

    try {
      const res = await fetch("/userlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      console.log(result,'Result');

      if (res.ok) {
        showMessage("User added successfully!", "success");
        form.reset();
        setTimeout(() => modal.classList.add("hidden"), 1000);
        document.getElementById("user-list-container").innerHTML = result.table_html;
        lucide.createIcons();
        //location.reload(); // refresh user list if needed
      } else {
        showMessage(result.error || "Failed to add user.", "error");
      }

    } catch (err) {
      showMessage("An unexpected error occurred.", "error");
    }
  });

  function showMessage(msg, type) {
    messageBox.textContent = msg;
    messageBox.classList.remove("hidden", "bg-red-100", "text-red-600", "bg-green-100", "text-green-600");
    if (type === "success") {
      messageBox.classList.add("bg-green-100", "text-green-600");
    } else {
      messageBox.classList.add("bg-red-100", "text-red-600");
    }
  }


});