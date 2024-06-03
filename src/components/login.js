import React from 'react';
import logo from '../assets/Logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Login.css';  // Import the custom CSS

const Login = () => {
  return (
    <div className="login-bg d-flex vh-100 text-white">
      <div className="container my-auto">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center"style={{display:'flex', flexDirection:'column', alignItems:'center'}}s>
            <img 
              src={logo} 
              alt="logo" 
              className="img-fluid mb-4" 
              style={{ height: '60px', width: '60px' }} 
            />
            <h1 className="mb-4">Yearbook 2024</h1>
            <h5 className="mb-1">“From campus to forever,</h5>
            <h5 className="mb-4">your story immortalized”</h5>
            <h5 className="mb-2">Class of 2023</h5>
            <h5 className="mb-4">Class of 2022</h5>
            <button className="btn btn-lg mb-4" style={{ backgroundColor: '#a55c1b', color: 'white', borderRadius: '50px', padding: '10px 30px' }}>Login</button>
            <h6 className="mb-3">Follow Us</h6>
            <div className="d-flex justify-content-center">
              <i className="fab fa-facebook fa-2x mx-2"></i>
              <i className="fab fa-instagram fa-2x mx-2"></i>
              <i className="fab fa-youtube fa-2x mx-2"></i>
              <i className="fab fa-linkedin fa-2x mx-2"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
