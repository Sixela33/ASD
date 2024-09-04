import { Routes, Route, Outlet } from 'react-router-dom';
import './app.css'
import Layout from './components/Layout';
import PersistLogin from './components/PersistLogin';
import RequireAuth from './components/RequireAuth';
import Navbar from './components/NavBar';
import Alert from './components/Alert';
import ROLES_LIST from '../../config/rolesList';
import { Suspense } from 'react';

import Home from './pages/Home';
import Login from './pages/Login';
import Missing from './pages/Missing';
import CreateProject from './pages/Projects/CreateProject';
import ProjectsList from './pages/Projects/ProjectsList';
import ViewProject from './pages/Projects/ViewSingleProject';
import ViewFlowers from './pages/Flowers/ViewFlowers';
import SingleFlowerPage from './pages/Flowers/SingleFlowerPage';
import AddInvoice from './pages/Invoices/2.0/AddInvoice';
import ViewInvoices from './pages/Invoices/ViewInvoices';
import LoadingPage from './pages/LoadingPage';
import ViewSingleInvoice from './pages/Invoices/ViewSingleInvoice';
import ArrangementCreation from './pages/ArrangementCreation';
import InactiveUserPage from './pages/InactiveUserPage';
import Admin from './pages/Admin/Admin';
import BankStatementsList from './pages/BankStatements/BankStatementsList';
import CreateBankStatement from './pages/BankStatements/CreateBankStatement';
import LinkBankStatement from './pages/BankStatements/LinkBankStatement';
import ViewSingleBankStatement from './pages/BankStatements/ViewSingleBankStatement';
import BankTransactionsList from './pages/BankTransactions/BankTransactionsList';
import ViewSingleTransaction from './pages/BankTransactions/ViewSingleTransaction';

function App() {

  return (
    <div className='app'>
      <Navbar/>
      <Alert/>
      <Suspense fallback={<LoadingPage/>}>
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
                <Route path="/flowers/:id" element={<SingleFlowerPage/>}/>
                <Route path="project/create/:id?" element={<CreateProject/>}/>      
                <Route path="/bankStatements" element={<BankStatementsList/>}></Route>
                <Route path="/bankStatement/add/:id?" element={<CreateBankStatement/>}></Route>
                <Route path="/bankStatement/link/:id" element={<LinkBankStatement/>}></Route>
                <Route path='/bankStatement/:id' element={<ViewSingleBankStatement/>}></Route>
                <Route path='/bankTransactions' element={<BankTransactionsList/>}></Route>
                <Route path='/bankTransactions/:id' element={<ViewSingleTransaction/>}></Route>
              </Route>

              <Route element={<RequireAuth allowedRoles={ROLES_LIST['Admin']} />}>
                <Route path="admin/" element={<Admin/>}/>            
              </Route>

            </Route>
            
            {/* catch all */}
            <Route path="*" element={<Missing />} />
          </Route>
        </Routes>
      </Suspense>

    </div>
  );
}

export default App;