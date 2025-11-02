lucide.createIcons();

document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.querySelector('button.bg-blue-600');
  const modal = document.getElementById('addUserModal');
  const closeModal = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const form = document.getElementById('addUserForm');
  const messageBox = document.getElementById("formMessage");

  // Update modal elements
  const updateModal = document.getElementById('updateUserModal');
  const closeUpdateModal = document.getElementById('closeUpdateModal');
  const cancelUpdateBtn = document.getElementById('cancelUpdateBtn');
  const updateForm = document.getElementById('updateUserForm');
  const updateMessageBox = document.getElementById('updateFormMessage');

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

  /* ------------------ Update modal behavior ------------------ */

  // Event delegation for update button clicks (works after table refresh)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-update');
    if (!btn) return;

    // find data either on button or on closest table row
    const tr = btn.closest('tr');
    const id = btn.dataset.id || tr?.dataset?.id;
    const username = tr?.dataset?.username || btn.dataset.username || '';
    const email = tr?.dataset?.email || btn.dataset.email || '';
    const content = tr?.dataset?.content || btn.dataset.content || '';

    // populate form
    updateForm.querySelector('[name="id"]').value = id;
    updateForm.querySelector('[name="username"]').value = username;
    updateForm.querySelector('[name="email"]').value = email;
    updateForm.querySelector('[name="content"]').value = content;

    // show modal
    updateModal.classList.remove('hidden');
  });

  // Hide update modal handlers
  [closeUpdateModal, cancelUpdateBtn].forEach(btnEl => {
    if (!btnEl) return;
    btnEl.addEventListener('click', () => updateModal.classList.add('hidden'));
  });

  // Submit update via AJAX
  updateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(updateForm);
    const data = Object.fromEntries(formData.entries());
    const id = data.id;

    try {
      const res = await fetch(`/update_user/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: data.username, email: data.email, content: data.content })
      });

      const result = await res.json();
      if (res.ok) {
        // refresh table HTML
        document.getElementById('user-list-container').innerHTML = result.table_html;
        lucide.createIcons();
        updateModal.classList.add('hidden');
      } else {
        updateMessageBox.textContent = result.error || 'Failed to update user.';
        updateMessageBox.classList.remove('hidden');
      }
    } catch (err) {
      updateMessageBox.textContent = 'An unexpected error occurred.';
      updateMessageBox.classList.remove('hidden');
    }
  });


});