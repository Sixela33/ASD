import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PersistLogin from './components/PersistLogin';
import RequireAuth from './components/RequireAuth';
import Navbar from './components/NavBar';
import Alert from './components/Alert';

import Missing from './pages/Missing';
import Login from './pages/Login';
import Home from './pages/Home';
import Register from './pages/Register';
import Admin from './pages/Admin/Admin';
import User from './pages/Admin/User';
import CreateProject from './pages/CreateProject';

const ROLES = {
  'User': 2001,
  'Editor': 1984,
  'Admin': 5150
}

function App() {

  return (
    <>
      <Navbar/>
      <Alert/>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="login" element={<Login />} />
          {/*public routes 
          <Route path="linkpage" element={<LinkPage />} />
          <Route path="unauthorized" element={<Unauthorized />} />
          
          {/* we want to protect these routes */}
          <Route element={<PersistLogin />}>
            <Route element={<RequireAuth allowedRoles={['User']} />}>
              <Route path="/" element={<Home />} />
              <Route path="register" element={<Register />} />

            </Route>

            <Route element={<RequireAuth allowedRoles={['User']} />}>
              <Route path="admin" element={<Admin/>}/>
              <Route path="admin/:userid" element={<User/>}/>
              <Route path="project/create" element={<CreateProject/>}/>
            </Route>

          </Route>
          

          {/* catch all */}
          <Route path="*" element={<Missing />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;