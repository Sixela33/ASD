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

import LoadFlower from './pages/Flowers/LoadFlower';
import ViewFlowers from './pages/Flowers/ViewFlowers';
import AddInvoice from './pages/AddInvoice';

function App() {

  return (
    <>
      <Navbar/>
      <Alert/>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="login" element={<Login />} />


          
          {/* protected routes */}
          <Route element={<PersistLogin />}>
            <Route element={<RequireAuth allowedRoles={['User']} />}>
              <Route path="/" element={<Home />} />
              <Route path="register" element={<Register />} />
              <Route path="/flowers/create" element={<LoadFlower/>}/>
              <Route path="/flowers" element={<ViewFlowers/>}/>
              <Route path="/invoice/add" element={< AddInvoice/>}></Route>
            </Route>

            <Route element={<RequireAuth allowedRoles={['Admin']} />}>
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