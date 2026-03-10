'use client'

import { Server } from "@/types/server";
import { useState } from "react";

export default function Dashboard() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [servers, setServers] = useState<Server[]>([])
  return (
    <section className="flex flex-1 flex-col text-textHigh">
      
    </section> 
  ); 
} 
