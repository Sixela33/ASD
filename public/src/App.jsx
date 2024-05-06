import { Routes, Route } from 'react-router-dom';
import './app.css'
import Layout from './components/Layout';
import PersistLogin from './components/PersistLogin';
import RequireAuth from './components/RequireAuth';
import Navbar from './components/NavBar';
import Alert from './components/Alert';
import ROLES_LIST from '../../config/rolesList';
import { lazy } from 'react';

import Home from './pages/Home';
import Login from './pages/Login';
import Missing from './pages/Missing';

const Admin = lazy(() => import('./pages/Admin/Admin'));

import CreateProject from './pages/Projects/CreateProject';
import ProjectsList from './pages/Projects/ProjectsList';
const ViewProject = lazy(() => import('./pages/Projects/ViewSingleProject'));

import LoadFlower from './pages/Flowers/LoadFlower';
import ViewFlowers from './pages/Flowers/ViewFlowers';
const SingleFlowerPage = lazy(() => import('./pages/Flowers/SingleFlowerPage'));

import AddInvoice from './pages/Invoices/AddInvoice';
import ViewInvoices from './pages/Invoices/ViewInvoices';
const ViewSingleInvoice = lazy(() => import('./pages/Invoices/ViewSingleInvoice'));
const ArrangementCreation = lazy(() => import('./pages/ArrangementCreation'));

const InactiveUserPage = lazy(() => import('./pages/InactiveUserPage'));

function App() {

  return (
    <div className='h-screen'>
      <Navbar/>
      <Alert/>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="login" element={<Login />} />
          <Route path='inactive' element={<InactiveUserPage/>}/>
          
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
              <Route path="project/create/:id?" element={<CreateProject/>}/>      
            </Route>

            <Route element={<RequireAuth allowedRoles={ROLES_LIST['Admin']} />}>
              <Route path="admin/" element={<Admin/>}/>            
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