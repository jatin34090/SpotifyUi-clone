import './style.css';
const API_URL = import.meta.env.VITE_API_URL;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;

document.addEventListener('DOMContentLoaded', ()=> {
  if(localStorage.getItem("acccessToken")){
    window.location.href = `${API_URL}/dashboard/dashboard.html`;
    // window.location.href = `dashboard/dashboard.html`;
  }else{
    window.location.href = `${REDIRECT_URI}`;
    // window.location.href = `login/login.html`;
  }
})