// Demo quotes
const quotes = [
  "Creativity is intelligence having fun.",
  "Turn your passion into profit!",
  "Every GIF captures a moment.",
  "Art is the journey of a free soul.",
  "Share your vision with the world."
];
// Categories
const imageCategories = ['Nature','Art','Technology','Food','Travel','Fashion','Architecture','Abstract','Portraits','Landscapes'];
const gifCategories = ['Entertainment','Reactions','Sports','Tutorials','Memes'];

// Util
function $(id){ return document.getElementById(id); }
function showModal(mid){ $(mid).style.display='flex'; }
function closeModal(mid){ $(mid).style.display='none'; }

// Welcome popup
window.onload = () => {
  $('quote').innerText = quotes[Math.floor(Math.random()*quotes.length)];
  showModal('welcomeModal');
  loadCategories();
  loadImages();
};
function closeWelcomeModal(){ closeModal('welcomeModal'); }

// Dynamic Category select
function loadCategories() {
  let sel = $('upload-category');
  imageCategories.concat(gifCategories).forEach(c => {
    let option = document.createElement('option');
    option.value = c; option.innerText = c;
    sel.appendChild(option);
  });
}

// Image/GIF database (simulated with localStorage)
function getContent(){
  let items = JSON.parse(localStorage.getItem('visualshare_content')||"[]");
  return items;
}
function saveContent(items){
  localStorage.setItem('visualshare_content',JSON.stringify(items));
}
function loadImages(){
  let items = getContent();
  let list = $('image-list'); list.innerHTML = "";
  items.forEach((item,i)=>{
    let card = document.createElement('div');
    card.className = "image-card";
    if(item.type==="image")
      card.innerHTML = <img src="${item.file}" alt="" />;
    else
      card.innerHTML = <video src="${item.file}" controls autoplay loop muted></video>;
    card.innerHTML += `
      <div class="tags">${item.hashtags.join(' ')}</div>
      <div class="price">${item.price>0?'₹'+item.price:'Free'}</div>
      <div class="author">Uploader: ${item.uploader}</div>
      <button class="download-btn" onclick="downloadContent(${i})">${item.price>0?"Buy & Download":"Download"}</button>
    `;
    list.appendChild(card);
  });
}

// Upload image/GIF
function showUploadModal(){ showModal('uploadModal'); }
function closeUploadModal(){ closeModal('uploadModal'); $('upload-file').value=""; }
$('upload-type').onchange = function(){
  if(this.value==='gif') $('upload-category').value=gifCategories[0];
  else $('upload-category').value=imageCategories;
};
$('free').onclick = ()=>{$('upload-price').style.display='none';};
$('paid').onclick = ()=>{$('upload-price').style.display='inline-block';};

function saveUpload() {
  let user = getCurrentUser();
  if(!user){
    alert("Please fill Profile (Gmail) before uploading.");
    return;
  }
  let title = $('upload-title').value.trim();
  let desc = $('upload-desc').value.trim();
  let cat = $('upload-category').value;
  let type = $('upload-type').value;
  let hashtags = $('upload-hashtag').value.split(',').map(t=>t.trim()).filter(t=>t&&t.startsWith('#'));
  let price = ($('paid').checked)?parseInt($('upload-price').value,10):0;
  let fileInput = $('upload-file');
  if(!fileInput.files[0]){ alert("Please select a file."); return; }
  let reader = new FileReader();
  reader.onload = function(e){
    let items = getContent();
    items.unshift({
      title,desc,category:cat,type,hashtags,price,file:e.target.result,uploader:user.gmail
    });
    saveContent(items);
    loadImages();
    closeUploadModal();
  };
  reader.readAsDataURL(fileInput.files);
}

// Simulated user profile
function showProfile(){
  showModal('profileModal');
  let user = getCurrentUser();
  $('profile-gmail').value=user?user.gmail:"";
  $('profile-upi').value=user?user.upi:"";
  $('profile-content').innerHTML = user?<br>Welcome, ${user.gmail}<br>UPI: ${user.upi||'Not set'}:'<br>Welcome, Guest!<br>';
'}
function closeProfileModal(){
  let gmail = $('profile-gmail').value.trim();
  let upi = $('profile-upi').value.trim();
  let qr = $('profile-qr').files;
  let user = {gmail,upi,qrqr:null};
  if(qr){ // Simulate QR image upload
    let reader = new FileReader();
    reader.onload = function(e){
      user.qrqr=e.target.result;
      saveUser(user);
    }; reader.readAsDataURL(qr);
  }else{
    saveUser(user);
  }
  closeModal('profileModal');
}
function getCurrentUser(){
  return JSON.parse(localStorage.getItem('visualshare_user')||"null");
}
function saveUser(user){
  localStorage.setItem('visualshare_user',JSON.stringify(user));
}

// Download/Buy Image/GIF
function downloadContent(idx){
  let items = getContent();
  let item = items[idx];
  if(item.price>0){
    let user = getCurrentUser();
    if(!user||!user.upi){ alert('You must have UPI ID in profile!'); return; }
    // Simulate UPI payment dialog
    if(confirm(Pay ₹${item.price} via UPI to ${item.uploader}. Proceed?)){
      alert('UPI Payment Successful! File will download.');
      triggerDownload(item);
    }
  }else{
    triggerDownload(item);
  }
}
// Helper for download
function triggerDownload(item){
  let a = document.createElement('a');
  a.href = item.file;
  a.download = item.title+(item.type==="image"?".jpg":".mp4");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Search
$('search').oninput = function(){
  let query = this.value.trim().toLowerCase();
  let items = getContent();
  if(!query){ loadImages(); return;}
  let filtered = items.filter(item =>
    item.hashtags.join(' ').toLowerCase().includes(query) ||
    item.uploader.toLowerCase().includes(query)
  );
  let list = $('image-list'); list.innerHTML = "";
  filtered.forEach((item,i)=>{
    let card = document.createElement('div');
    card.className = "image-card";
    if(item.type==="image")
      card.innerHTML = <img src="${item.file}" alt="" />;
    else
      card.innerHTML = <video src="${item.file}" controls autoplay loop muted></video>;
    card.innerHTML += `
      <div class="tags">${item.hashtags.join(' ')}</div>
      <div class="price">${item.price>0?'₹'+item.price:'Free'}</div>
      <div class="author">Uploader: ${item.uploader}</div>
      <button class="download-btn" onclick="downloadContent(${i})">${item.price>0?"Buy & Download":"Download"}</button>
    `;
    list.appendChild(card);
  });
};

// AI Chat Bot (simple simulation)
const chatbotAnswers = [
  "Hello! Ask me anything about the platform.",
  "Upload images or GIFs and set a price.",
  "Download free ones or buy paid ones via UPI.",
  "Search via #hashtags or profiles.",
  "Feel free to customize your profile via Gmail and UPI."
];
function toggleChatbot(){
  let box = $('chatbot');
  box.style.display = box.style.display==="none"||box.style.display===""?'flex':'none';
}
function chatSend(){
  let input = $('chat-input').value.trim();
  if(!input) return;
  let body = $('chat-body');
  body.innerHTML += <div>You: ${input}</div>;
  setTimeout(()=>{
    let idx = Math.floor(Math.random()*chatbotAnswers.length);
    body.innerHTML += <div><b>AI:</b> ${chatbotAnswers[idx]}</div>;
    body.scrollTop = body.scrollHeight;
  },700);
  $('chat-input').value = "";
}