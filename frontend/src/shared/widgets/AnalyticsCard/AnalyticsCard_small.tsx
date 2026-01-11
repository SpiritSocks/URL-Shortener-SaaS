import '../AnalyticsCard/AnalyticsCard_small.module.css';

type AnalyticsCard_smallProps = {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    text: string;
    icon_bgColor: string;
    icon_color: string;
}

const AnalyticsCard_small = ({icon: Icon, title, text, icon_bgColor, icon_color}: AnalyticsCard_smallProps) => {
    return (
        <section className="bg-white w-[300px] h-[150px] border-3 
        border-[#c8d69b] shadow-md flex flex-col justify-center p-5 rounded-[15px]">
            <div className="flex flex-row gap-3 items-center">
                <div className={icon_bgColor + " w-11 h-11 flex justify-center items-center rounded-[6px]"}>
                    <Icon className={icon_color}/>
                </div>
                <h3>{title}</h3>
            </div>
            <p className='mt-3'>{text}</p>
        </section>
    )
}

export default AnalyticsCard_small;