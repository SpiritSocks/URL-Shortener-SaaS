
type DashboardMenuProps = {
    isOpen: boolean;
}


const DashboardMenu = ({isOpen}: DashboardMenuProps) => {
    if (!isOpen) return null;
    return (
        <>
        <h1>This is the dashboard</h1>
        </>
    )
}

export default DashboardMenu;