import { Outlet } from "react-router-dom"

const Layout = () => {
    return (
        <main className="page">
            <Outlet />
        </main>
    )
}

export default Layout