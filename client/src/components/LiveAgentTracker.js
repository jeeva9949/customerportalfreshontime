import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { create } from 'zustand';
import io from 'socket.io-client'; // FIX: Import io
import { format } from 'date-fns'; // FIX: Import format

// --- Configuration ---
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// --- State Management with Zustand ---
const useAgentsStore = create((set) => ({
    agents: {},
    filters: { status: 'All', showOffline: true, search: '' },
    selectedAgentId: null,
    setAgents: (agents) => set({ agents }),
    updateAgentLocation: (agentUpdate) => set((state) => ({
        agents: {
            ...state.agents,
            [agentUpdate.agent_id]: {
                ...state.agents[agentUpdate.agent_id],
                ...agentUpdate,
                agent: state.agents[agentUpdate.agent_id]?.agent || agentUpdate.agent
            }
        }
    })),
    setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
    setSelectedAgentId: (agentId) => set({ selectedAgentId: agentId }),
}));

// --- Custom Hooks ---
const useSocket = () => {
    const { setAgents, updateAgentLocation } = useAgentsStore();

    useEffect(() => {
        const socket = io(SOCKET_URL);

        socket.on('connect', () => console.log('Socket connected!'));
        socket.on('disconnect', () => console.log('Socket disconnected.'));
        socket.on('connect_error', (err) => console.error('Socket connection error:', err));

        socket.on('agentsSnapshot', (snapshot) => {
            console.log('Received agents snapshot:', snapshot);
            const agentsById = snapshot.reduce((acc, agent) => {
                acc[agent.agent_id] = agent;
                return acc;
            }, {});
            setAgents(agentsById);
        });

        socket.on('agentLocationUpdate', (update) => {
            updateAgentLocation(update);
        });

        return () => {
            socket.disconnect();
        };
    }, [setAgents, updateAgentLocation]);
};

// --- Helper Components ---
const AgentStatusIcon = ({ status }) => {
    const statusConfig = {
        'En Route': { color: 'bg-blue-500' },
        'Idle': { color: 'bg-green-500' },
        'Delivered': { color: 'bg-purple-500' },
        'Offline': { color: 'bg-gray-400' },
    };
    const config = statusConfig[status] || { color: 'bg-gray-400' };
    return <span className={`w-3 h-3 rounded-full ${config.color} mr-2 flex-shrink-0`}></span>;
};

const AgentListItem = ({ agent, isSelected, onSelect, onFocus }) => {
    return (
        <li
            onClick={onSelect}
            className={`p-3 flex items-center justify-between cursor-pointer rounded-lg transition-colors ${isSelected ? 'bg-indigo-100' : 'hover:bg-gray-50'}`}
        >
            <div className="flex items-center overflow-hidden">
                <AgentStatusIcon status={agent.status} />
                <div className="flex-grow overflow-hidden">
                    <p className="font-semibold text-sm text-gray-800 truncate">{agent.agent?.name || `Agent ID: ${agent.agent_id}`}</p>
                    <p className="text-xs text-gray-500">
                        Updated: {format(new Date(agent.last_update), 'p')}
                    </p>
                </div>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onFocus(); }}
                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-2 rounded-md transition-colors"
            >
                Focus
            </button>
        </li>
    );
};

// FIX: Define TabButton locally since it's not in a shared file
const TabButton = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${isActive ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
        {label}
    </button>
);


// --- Main Components ---

const AgentsSidebar = ({ onAgentFocus }) => {
    const { agents, filters, setFilters, selectedAgentId, setSelectedAgentId } = useAgentsStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const filteredAgents = useMemo(() => {
        return Object.values(agents)
            .filter(agent => {
                if (!filters.showOffline && agent.status === 'Offline') return false;
                if (filters.status !== 'All' && agent.status !== filters.status) return false;
                const agentName = agent.agent?.name?.toLowerCase() || '';
                return agentName.includes(filters.search.toLowerCase());
            })
            .sort((a, b) => new Date(b.last_update) - new Date(a.last_update));
    }, [agents, filters]);

    return (
        <>
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="fixed top-20 left-4 z-20 md:hidden bg-white p-2 rounded-full shadow-lg text-gray-700"
            >
                {isSidebarOpen ? '🗺️' : '👥'}
            </button>
            <aside className={`absolute md:relative z-10 w-full md:w-96 h-full bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="p-4 border-b">
                    <h2 className="text-lg font-bold text-gray-800">Live Agents</h2>
                    <p className="text-sm text-gray-500">{filteredAgents.length} agents visible</p>
                </div>
                <div className="p-4 border-b">
                    <input
                        type="text"
                        placeholder="Search agents..."
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => setFilters({ search: e.target.value })}
                    />
                    <div className="flex items-center justify-between mt-4">
                        <label className="flex items-center text-sm text-gray-600">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                checked={filters.showOffline}
                                onChange={(e) => setFilters({ showOffline: e.target.checked })}
                            />
                            <span className="ml-2">Show Offline</span>
                        </label>
                    </div>
                </div>
                <ul className="flex-grow overflow-y-auto p-2 space-y-1">
                    {filteredAgents.length > 0 ? (
                        filteredAgents.map(agent => (
                            <AgentListItem
                                key={agent.agent_id}
                                agent={agent}
                                isSelected={selectedAgentId === agent.agent_id}
                                onSelect={() => setSelectedAgentId(agent.agent_id)}
                                onFocus={() => onAgentFocus(agent)}
                            />
                        ))
                    ) : (
                        <p className="text-center text-gray-500 p-4">No agents match filters.</p>
                    )}
                </ul>
            </aside>
        </>
    );
};

const AdminAgentsMap = ({ mapRef, onMapLoad }) => {
    const { agents, selectedAgentId, setSelectedAgentId } = useAgentsStore();
    const visibleAgents = Object.values(agents).filter(a => a.status !== 'Offline');

    const statusIcons = {
        'En Route': { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png', scale: 1.2 },
        'Idle': { url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png', scale: 1.2 },
        'Delivered': { url: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png', scale: 1.2 },
        'Offline': { url: 'http://maps.google.com/mapfiles/ms/icons/grey-dot.png', scale: 1.0 },
    };

    useEffect(() => {
        if (mapRef.current && visibleAgents.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            visibleAgents.forEach(agent => {
                bounds.extend({ lat: parseFloat(agent.latitude), lng: parseFloat(agent.longitude) });
            });
            mapRef.current.fitBounds(bounds);
        }
    }, [agents, mapRef, visibleAgents]);

    return (
        <GoogleMap
            mapContainerClassName="w-full h-full"
            center={{ lat: 12.9716, lng: 77.5946 }} // Default to Bengaluru
            zoom={12}
            onLoad={onMapLoad}
            options={{
                disableDefaultUI: true,
                zoomControl: true,
                styles: [/* Modern map styles can be added here */]
            }}
        >
            {visibleAgents.map(agent => (
                <Marker
                    key={agent.agent_id}
                    position={{ lat: parseFloat(agent.latitude), lng: parseFloat(agent.longitude) }}
                    onClick={() => setSelectedAgentId(agent.agent_id)}
                    icon={{
                        url: (statusIcons[agent.status] || statusIcons['Offline']).url,
                        scaledSize: new window.google.maps.Size(35, 35)
                    }}
                />
            ))}

            {selectedAgentId && agents[selectedAgentId] && (
                <InfoWindow
                    position={{ lat: parseFloat(agents[selectedAgentId].latitude), lng: parseFloat(agents[selectedAgentId].longitude) }}
                    onCloseClick={() => setSelectedAgentId(null)}
                >
                    <div className="p-1">
                        <h3 className="font-bold text-md">{agents[selectedAgentId].agent?.name}</h3>
                        <p className="text-sm">Status: {agents[selectedAgentId].status}</p>
                        <p className="text-xs text-gray-500">Last Update: {format(new Date(agents[selectedAgentId].last_update), 'p')}</p>
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    );
};

export default function LiveAgentTrackerPage() {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    });
    const { filters, setFilters } = useAgentsStore();
    const mapRef = useRef(null);

    useSocket(); // Initialize socket connection and listeners

    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
    }, []);

    const handleAgentFocus = (agent) => {
        if (mapRef.current) {
            mapRef.current.panTo({ lat: parseFloat(agent.latitude), lng: parseFloat(agent.longitude) });
            mapRef.current.setZoom(15);
        }
    };

    if (loadError) return <div>Error loading maps. Please check your API key.</div>;
    if (!isLoaded) return <div className="flex items-center justify-center h-screen">Loading Map...</div>;

    return (
        <div className="flex h-screen font-sans">
            <AgentsSidebar onAgentFocus={handleAgentFocus} />
            <main className="flex-1 flex flex-col relative">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white p-2 rounded-full shadow-lg flex gap-2">
                    <TabButton label="All" isActive={filters.status === 'All'} onClick={() => setFilters({ status: 'All' })} />
                    <TabButton label="En Route" isActive={filters.status === 'En Route'} onClick={() => setFilters({ status: 'En Route' })} />
                    <TabButton label="Idle" isActive={filters.status === 'Idle'} onClick={() => setFilters({ status: 'Idle' })} />
                </div>
                <AdminAgentsMap mapRef={mapRef} onMapLoad={onMapLoad} />
            </main>
        </div>
    );
}
