
import { MousePointerClick, Link2, TrendingUp, Calendar, Globe, Smartphone, ComputerIcon, MonitorCog} from "lucide-react";

import AnalyticsCard_small from "@/shared/widgets/AnalyticsCard/AnalyticsCard_small";
import GraphCard from "@/shared/widgets/GraphCard/GraphCard";

import BarChartGraph from "@/shared/widgets/Graphs/BarChartGraph";
import PieChartGraph from "@/shared/widgets/Graphs/PieChartGraph";
import LineChartGraph from "@/shared/widgets/Graphs/LineChartGraph";

type DashboardMenuProps = {
    isOpen: boolean;
}


const DashboardMenu = ({isOpen}: DashboardMenuProps) => {
    if (!isOpen) return null;
    return (
        <>
        <section id="analytics-section" className="flex flex-col items-center gap-10 pt-4 px-10">
            <h1 className="font-bold text-md sm:text-3xl text-[#343b1b]">Your Analytics</h1>
            <div className="flex flex-col flex-wrap sm:flex-row md:flex-row lg:flex-row justify-center gap-10">
                
                <AnalyticsCard_small
                icon={Link2}
                title="Total Links"
                text="0"
                icon_bgColor="bg-[#c8d69b]"
                icon_color=""/>

                <AnalyticsCard_small
                icon={MousePointerClick}
                title="Total Clicks"
                text="0"
                icon_bgColor="bg-[#4c6fb1]"
                icon_color="text-white"/>

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

        <section id="graph-section" className="min-h-screen mt-10 px-10">
            <div>
                <GraphCard
                    icon={TrendingUp}
                    title = "Clicks Over Time">
                    <LineChartGraph/>
                </GraphCard>    
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 md:grid-cols-2 gap-6 w-full pt-10">
                <GraphCard
                    icon={Globe}
                    title="Top Countries">
                    <BarChartGraph/>
                </GraphCard>

                <GraphCard
                    icon={Smartphone}
                    title="Device Types">
                        <PieChartGraph/>
                    </GraphCard>

                <GraphCard
                    icon={ComputerIcon}
                    title="Browser Distribution">
                        <PieChartGraph/>
                    </GraphCard>

                <GraphCard
                    icon={MonitorCog}
                    title="Operating System">
                        <BarChartGraph/>
                </GraphCard>
            </div>
        </section>
        </>
    )
}

export default DashboardMenu;