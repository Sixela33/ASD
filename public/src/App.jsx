import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PersistLogin from './components/PersistLogin';
import RequireAuth from './components/RequireAuth';
import Navbar from './components/NavBar';
import Alert from './components/Alert';

import Missing from './pages/Missing';
import Login from './pages/Login';
import Home from './pages/Home';
import Admin from './pages/Admin/Admin';
import User from './pages/Admin/User';
import CreateProject from './pages/Projects/CreateProject';
import ProjectsList from './pages/Projects/ProjectsList';
import ViewProject from './pages/Projects/ViewProject';

import LoadFlower from './pages/Flowers/LoadFlower';
import ViewFlowers from './pages/Flowers/ViewFlowers';
import AddInvoice from './pages/Invoices/AddInvoice';
import ViewInvoices from './pages/Invoices/ViewInvoices';
import ViewSingleInvoice from './pages/Invoices/ViewSingleInvoice';
import ArrangementCreation from './pages/ArrangementCreation';
import SingleFlowerPage from './pages/Flowers/SingleFlowerPage';
import './app.css'
import ROLES_LIST from '../../config/rolesList';
function App() {

  return (
    <div className='h-screen'>
      <Navbar/>
      <Alert/>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="login" element={<Login />} />
          
          {/* protected routes */}
          <Route element={<PersistLogin />}>
            <Route element={<RequireAuth allowedRoles={ROLES_LIST['User']} />}>
              <Route path="/" element={<Home />} />
              <Route path="/flowers" element={<ViewFlowers/>}/>
              <Route path="/projects" element={<ProjectsList/>}></Route>
              <Route path="/projects/:id" element={<ViewProject/>}></Route>
              <Route path="/arrangement/:id" element={<ArrangementCreation/>}></Route>
              
            </Route>

            <Route element={<RequireAuth allowedRoles={ROLES_LIST['Staff']} />}>
              <Route path="/invoice" element={<ViewInvoices/>}></Route>
              <Route path="/invoice/add/:id?" element={< AddInvoice/>}></Route>
              <Route path='/invoice/view/:id' element={<ViewSingleInvoice/>}></Route>
              <Route path="/flowers/create" element={<LoadFlower/>}/>
              <Route path="/flowers/:id" element={<SingleFlowerPage/>}/>

            </Route>

            <Route element={<RequireAuth allowedRoles={ROLES_LIST['Admin']} />}>
              <Route path="admin" element={<Admin/>}/>
              <Route path="admin/:userid" element={<User/>}/>
              <Route path="project/create/:id?" element={<CreateProject/>}/>      

            </Route>

          </Route>
          

          {/* catch all */}
          <Route path="*" element={<Missing />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;