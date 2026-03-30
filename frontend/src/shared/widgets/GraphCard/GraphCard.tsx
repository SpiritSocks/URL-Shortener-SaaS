type GraphCardProps = {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    children: React.ReactNode;
};

const GraphCard = ({ icon: Icon, title, children }: GraphCardProps) => {
    return (
        <div className="bg-white w-full h-full border-3 border-[#c8d69b] shadow-md flex flex-col p-5 rounded-[15px]">
            <div className="flex items-center gap-3 mb-4">
                <Icon className="text-[#4c6fb1] w-5 h-5 md:w-6 md:h-6" />
                <h2 className="text-small md:text-2xl font-semibold text-[#343b1b]">{title}</h2>
            </div>
            <div className="grow">
                {children}
            </div>
        </div>
    );
};

export default GraphCard;
