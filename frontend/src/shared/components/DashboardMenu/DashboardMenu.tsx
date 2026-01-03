
import { MousePointerClick, Link2, TrendingUp, Calendar } from "lucide-react";


import AnalyticsCard_small from "@/shared/widgets/AnalyticsCard/AnalyticsCard_small";

type DashboardMenuProps = {
    isOpen: boolean;
}


const DashboardMenu = ({isOpen}: DashboardMenuProps) => {
    if (!isOpen) return null;
    return (
        <>
        <section className="flex flex-col items-center gap-10 pt-4 ">
            <h1 className="font-bold text-md sm:text-3xl">Your Analytics</h1>
            <div className="flex flex-col sm:flex-row justify-center gap-10">

                <AnalyticsCard_small
                icon={MousePointerClick}
                title="Total Clicks"
                text="0"
                icon_bgColor="bg-[#4c6fb1]"
                icon_color="text-white"/>

                <AnalyticsCard_small
                icon={Link2}
                title="Total Links"
                text="0"
                icon_bgColor="bg-[#c8d69b]"
                icon_color=""/>

                <AnalyticsCard_small
                icon={TrendingUp}
                title="Avg. Per Link"
                text="0"
                icon_bgColor="bg-[#f6e6a5]"
                icon_color=""/>

                <AnalyticsCard_small
                icon={Calendar}
                title="Avg. Per Day"
                text="0"
                icon_bgColor="bg-[#4c6fb1]"
                icon_color="text-white"/>

            </div>
        </section>
        </>
    )
}

export default DashboardMenu;