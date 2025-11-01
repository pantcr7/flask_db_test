
// Password toggle
function togglePassword() {
    const pwd = document.getElementById('password');
    const icon = document.querySelector('.toggle-password');
    if(pwd.type === "password"){
        pwd.type = "text";
        icon.classList.replace('fa-eye','fa-eye-slash');
    } else {
        pwd.type = "password";
        icon.classList.replace('fa-eye-slash','fa-eye');
    }
}

// Floating bubbles
for(let i=0;i<25;i++){
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    const size = Math.random()*10 + 5;
    bubble.style.width = size+'px';
    bubble.style.height = size+'px';
    bubble.style.left = Math.random()*window.innerWidth+'px';
    bubble.style.top = Math.random()*window.innerHeight+'px';
    document.body.appendChild(bubble);
    animateBubble(bubble);
}

function animateBubble(bubble){
    let speed = Math.random()*1 + 0.3;
    let x = parseFloat(bubble.style.left);
    let y = parseFloat(bubble.style.top);
    function move(){
        y -= speed;
        if(y < -20){ y = window.innerHeight; x=Math.random()*window.innerWidth; }
        bubble.style.top = y+'px';
        bubble.style.left = x+'px';
        requestAnimationFrame(move);
    }
    move();
}
