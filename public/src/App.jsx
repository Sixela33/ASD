import { Routes, Route } from 'react-router-dom';
import './app.css'
import Layout from './components/Layout';
import PersistLogin from './components/PersistLogin';
import RequireAuth from './components/RequireAuth';
import Navbar from './components/NavBar';
import Alert from './components/Alert';
import ROLES_LIST from '../../config/rolesList';
import { lazy } from 'react';

const Missing = lazy(() => import('./pages/Missing'));
const Login = lazy(() => import('./pages/Login'));
const Home = lazy(() => import('./pages/Home'));

const Admin = lazy(() => import('./pages/Admin/Admin'));

const CreateProject = lazy(() => import('./pages/Projects/CreateProject'));
const ProjectsList = lazy(() => import('./pages/Projects/ProjectsList'));
const ViewProject = lazy(() => import('./pages/Projects/ViewSingleProject'));

const LoadFlower = lazy(() => import('./pages/Flowers/LoadFlower'));
const ViewFlowers = lazy(() => import('./pages/Flowers/ViewFlowers'));
const SingleFlowerPage = lazy(() => import('./pages/Flowers/SingleFlowerPage'));

const AddInvoice = lazy(() => import('./pages/Invoices/AddInvoice'));
const ViewInvoices = lazy(() => import('./pages/Invoices/ViewInvoices'));
const ViewSingleInvoice = lazy(() => import('./pages/Invoices/ViewSingleInvoice'));
const ArrangementCreation = lazy(() => import('./pages/ArrangementCreation'));

const InputEmail = lazy(() => import('./pages/PasswordRecovery/InputEmail'));
const SetNewPass = lazy(() => import('./pages/PasswordRecovery/SetNewPass'));
const InactiveUserPage = lazy(() => import('./pages/InactiveUserPage'));
const LoginSuccess = lazy(() => import('./pages/LoginSuccess'));


function App() {

  return (
    <div className='h-screen'>
      <Navbar/>
      <Alert/>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="login" element={<Login />} />
          <Route path="forgotPass" element={<InputEmail/>} />
          <Route path="setNewPass/:id/:code" element={<SetNewPass/>} />
          <Route path='inactive' element={<InactiveUserPage/>}/>
          <Route path='loginSuccess' element={<LoginSuccess/>}/>
          
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
              <Route path="admin/" element={<Admin/>}/>            
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