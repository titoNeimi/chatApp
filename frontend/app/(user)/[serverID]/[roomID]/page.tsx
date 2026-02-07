export default function RoomDashboardPlaceholder() {
  return (
    <div className="flex w-full flex-col justify-center overflow-hidden"> 
      <div className="max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/30 backdrop-blur"> 
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Dashboard</p> 
        <h1 className="mt-3 text-3xl font-semibold text-white">Dashboard</h1> 
        <p className="mt-3 text-sm leading-relaxed text-slate-400"> 
          Welcome to your dashboard! Here you can manage your account and settings. 
        </p> 
      </div> 
    </div> 
  )
}