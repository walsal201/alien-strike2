import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Radio, Battery, Wrench, ShoppingCart, TrendingUp, LogOut, Shield } from 'lucide-react';
import TacticalMap from '@/components/TacticalMap';
import DeploymentNotifier, { DeploymentNotification } from '@/components/DeploymentNotifier';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, logout, logDeployment, logActivity } = useAuth();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, navigate]);
  const TOTAL_DRONES = 9000000000;
  const BIG_DRONES = 3000000000;
  const MEDIUM_DRONES = 3000000000;
  const MINI_DRONES = 3000000000;
  const MINI_RETURN = 1500000000;
  const MINI_KAMIKAZE = 1500000000;

  const [activeTab, setActiveTab] = useState('operations');
  const [deploymentMode, setDeploymentMode] = useState('autonomous');
  const [selectedDroneType, setSelectedDroneType] = useState('all');
  const [selectedWeaponTypes, setSelectedWeaponTypes] = useState<string[]>(['transport-cargo']);
  const [selectedMiniWeaponTypes, setSelectedMiniWeaponTypes] = useState<string[]>(['mini-kamikaze']);
  const [weaponQuantities, setWeaponQuantities] = useState<Record<string, number>>({});
  const [deploymentCount, setDeploymentCount] = useState(100);
  const [targetLat, setTargetLat] = useState('31.9686');
  const [targetLon, setTargetLon] = useState('35.9163');
  
  const weaponOptions = [
    { value: 'transport-cargo', label: 'TRANSPORT & CARGO' },
    { value: 'nuclear-missiles', label: 'NUCLEAR MISSILES' },
    { value: 'supersonic-missiles', label: 'SUPERSONIC MISSILES' },
    { value: 'air-to-air', label: 'AIR-TO-AIR' },
    { value: 'air-to-surface', label: 'AIR-TO-SURFACE' },
    { value: 'surface-to-air', label: 'SURFACE-TO-AIR' },
    { value: 'antiship', label: 'ANTISHIP' },
    { value: 'antitank', label: 'ANTITANK' },
    { value: 'assault', label: 'ASSAULT' },
  ];

  const miniWeaponOptions = [
    { value: 'mini-kamikaze', label: 'MINI (KAMIKAZE)' },
    { value: 'mini-return', label: 'MINI RETURN' },
    { value: 'nano-spies', label: 'NANO SPIES' },
    { value: 'nano-robot-attack', label: 'NANO ROBOT ATTACK' },
    { value: 'nano-bio-attack', label: 'NANO BIO ATTACK' },
  ];
  
  const [droneStats, setDroneStats] = useState({
    deployed: 2456789,
    inTransit: 456123,
    returning: 789456,
    atBase: 126297632,
    engaging: 123456,
    damaged: 234567,
    maintenance: 567890,
    lowBattery: 345678
  });

  const [maintenanceData, setMaintenanceData] = useState({
    inMaintenance: 567890,
    repaired: 12456789,
    damaged: 234567,
    newPurchases: 5000000,
    scheduledUpdates: 1234567
  });

  const [activeDrones, setActiveDrones] = useState([
    { id: 45123789, type: 'Big', status: 'deployed', lat: 32.1234, lon: 35.5678, battery: 87, color: 'red', deployedAt: Date.now() - 60000 },
    { id: 78234567, type: 'Medium', status: 'transit', lat: 31.9876, lon: 35.8901, battery: 92, color: 'blue', deployedAt: Date.now() - 45000 },
    { id: 12345678, type: 'Mini-Return', status: 'returning', lat: 31.5432, lon: 36.1234, battery: 45, color: 'orange', deployedAt: Date.now() - 35000 },
    { id: 98765432, type: 'Big', status: 'engaging', lat: 32.4567, lon: 35.6789, battery: 78, color: 'red', deployedAt: Date.now() - 25000 },
    { id: 23456789, type: 'Mini-Kamikaze', status: 'eliminated', lat: 31.8765, lon: 35.9012, battery: 0, color: 'pink', deployedAt: Date.now() - 15000 },
    { id: 56789012, type: 'Medium', status: 'deployed', lat: 32.0123, lon: 35.7890, battery: 81, color: 'red', deployedAt: Date.now() - 8000 },
    { id: 34567890, type: 'Mini-Kamikaze', status: 'eliminated', lat: 32.3456, lon: 35.4567, battery: 0, color: 'pink', deployedAt: Date.now() - 3000 },
    { id: 87654321, type: 'Big', status: 'terminated', lat: 31.7654, lon: 36.0987, battery: 0, color: 'pink', deployedAt: Date.now() }
  ]);

  const [crewAiConnected, setCrewAiConnected] = useState(false);
  const [deploymentNotifications, setDeploymentNotifications] = useState<DeploymentNotification[]>([]);

  const addNotification = (lat: string, lon: string, count: number, mode: string) => {
    const notification: DeploymentNotification = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lat,
      lon,
      count,
      mode,
      timestamp: Date.now()
    };
    setDeploymentNotifications(prev => [notification, ...prev]);
  };

  const dismissNotification = (id: string) => {
    setDeploymentNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Connect to Crew AI backend
  useEffect(() => {
    const connectCrewAi = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crew-ai-sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'get_drone_status',
            data: {}
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Crew AI connected:', data);
          setCrewAiConnected(true);
          
          // Update stats with Crew AI data if available
          if (data.stats) {
            setDroneStats(data.stats);
          }
          if (data.maintenance) {
            setMaintenanceData(data.maintenance);
          }
        }
      } catch (error) {
        console.error('Crew AI connection error:', error);
      }
    };
    
    connectCrewAi();
    const interval = setInterval(connectCrewAi, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  const toggleWeaponType = (value: string, isSelected: boolean, isMini: boolean) => {
    if (isMini) {
      if (isSelected) {
        setSelectedMiniWeaponTypes(prev => prev.filter(v => v !== value));
        setWeaponQuantities(prev => {
          const updated = { ...prev };
          delete updated[value];
          return updated;
        });
      } else {
        setSelectedMiniWeaponTypes(prev => [...prev, value]);
        setWeaponQuantities(prev => ({ ...prev, [value]: 100 }));
      }
    } else {
      if (isSelected) {
        setSelectedWeaponTypes(prev => prev.filter(v => v !== value));
        setWeaponQuantities(prev => {
          const updated = { ...prev };
          delete updated[value];
          return updated;
        });
      } else {
        setSelectedWeaponTypes(prev => [...prev, value]);
        setWeaponQuantities(prev => ({ ...prev, [value]: 100 }));
      }
    }
  };

  const updateWeaponQuantity = (weapon: string, quantity: number) => {
    setWeaponQuantities(prev => ({ ...prev, [weapon]: quantity }));
  };

  // Calculate totals for validation
  const bigMediumTotal = selectedWeaponTypes.reduce((sum, w) => sum + (weaponQuantities[w] || 0), 0);
  const miniTotal = selectedMiniWeaponTypes.reduce((sum, w) => sum + (weaponQuantities[w] || 0), 0);
  const combinedTotal = bigMediumTotal + miniTotal;
  
  // For ALL TYPES: Big/Medium + Mini combined must equal deploymentCount
  // For Big/Medium types: only Big/Medium must equal deploymentCount
  // For Mini type: only Mini must equal deploymentCount
  const isDeploymentValid = (() => {
    if (selectedDroneType === 'all') {
      const hasWeapons = selectedWeaponTypes.length > 0 || selectedMiniWeaponTypes.length > 0;
      return hasWeapons && combinedTotal === deploymentCount;
    }
    if (selectedDroneType === 'big' || selectedDroneType === 'medium') {
      return selectedWeaponTypes.length > 0 && bigMediumTotal === deploymentCount;
    }
    if (selectedDroneType === 'mini') {
      return selectedMiniWeaponTypes.length > 0 && miniTotal === deploymentCount;
    }
    return true;
  })();

  const deployDrones = async () => {
    const isMiniDrone = selectedDroneType === 'mini';
    const isAllTypes = selectedDroneType === 'all';
    const deployData = {
      mode: deploymentMode,
      type: selectedDroneType,
      weaponTypes: isAllTypes ? [...selectedWeaponTypes, ...selectedMiniWeaponTypes] : (isMiniDrone ? selectedMiniWeaponTypes : selectedWeaponTypes),
      count: deploymentCount,
      target: { lat: targetLat, lon: targetLon }
    };
    
    // Log deployment to audit trail (non-blocking for speed)
    logDeployment(
      deploymentMode,
      selectedDroneType,
      deploymentCount,
      parseFloat(targetLat),
      parseFloat(targetLon)
    );
    
    const targetLatNum = parseFloat(targetLat);
    const targetLonNum = parseFloat(targetLon);
    const deployTime = Date.now();
    
    // Optimized batch drone generation for handling billions
    // Only create visual representatives (max 1000 markers on map)
    const visualLimit = Math.min(deploymentCount, 1000);
    const types = ['Big', 'Medium', 'Mini-Return', 'Mini-Kamikaze'];
    
    // Pre-calculate drone type mapping
    const getDroneType = () => {
      if (selectedDroneType === 'big') return 'Big';
      if (selectedDroneType === 'medium') return 'Medium';
      if (selectedDroneType === 'mini-return') return 'Mini-Return';
      if (selectedDroneType === 'mini-kamikaze') return 'Mini-Kamikaze';
      return types[Math.floor(Math.random() * 4)];
    };
    
    // Batch create drone objects using simple Math.random (fast enough for 1000 drones)
    const newDrones = new Array(visualLimit);
    const baseId = Math.floor(Math.random() * 9000000000);
    
    for (let i = 0; i < visualLimit; i++) {
      newDrones[i] = {
        id: baseId + i,
        type: getDroneType(),
        status: 'deployed',
        lat: targetLatNum + (Math.random() - 0.5) * 0.6,
        lon: targetLonNum + (Math.random() - 0.5) * 0.6,
        battery: 85 + Math.floor(Math.random() * 15),
        color: 'red',
        deployedAt: deployTime
      };
    }
    
    // Immediate UI update for fast response
    setActiveDrones(prev => [...prev, ...newDrones]);
    
    // Add notification immediately
    addNotification(targetLat, targetLon, deploymentCount, deploymentMode);
    
    // Update stats immediately
    setDroneStats(prev => ({
      ...prev,
      deployed: prev.deployed + deploymentCount,
      atBase: Math.max(0, prev.atBase - deploymentCount)
    }));
    
    // Non-blocking backend sync
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crew-ai-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deploy_drones', data: deployData })
    }).catch(err => console.error('Deploy sync error:', err));
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'deployed': return 'text-red-500';
      case 'transit': return 'text-blue-400';
      case 'returning': return 'text-orange-400';
      case 'engaging': return 'text-red-600 font-bold';
      case 'terminated': return 'text-terminated-pink font-bold';
      case 'heat_target': return 'text-terminated-pink';
      default: return 'text-green-400';
    }
  };

  const handleLogout = () => {
    logActivity('LOGOUT', {});
    logout();
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-green-400 font-mono">INITIALIZING COMMAND CENTER...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-green-400 font-mono p-4">
      <DeploymentNotifier 
        notifications={deploymentNotifications} 
        onDismiss={dismissNotification} 
      />
      <div className="border-4 border-green-600 bg-black/50 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-400 tracking-wider">TACTICAL DRONE COMMAND</h1>
            <p className="text-yellow-400 text-sm">ANTI-HOSTILE DEFENSE SYSTEM v3.7</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-red-500 font-bold text-xl animate-pulse">⚠ THREAT LEVEL: HIGH</div>
              <div className="text-xs text-gray-400">System Time: {new Date().toLocaleString()}</div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-900/50 hover:bg-red-800 text-red-400 px-4 py-2 border-2 border-red-600 font-bold"
            >
              <LogOut className="w-4 h-4" />
              LOGOUT
            </button>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <Shield className="w-4 h-4 text-green-500" />
          <span className="text-green-500">SECURE SESSION ACTIVE</span>
          <span className="text-gray-500">• AES-256 ENCRYPTED</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="border-2 border-green-600 bg-black/70 p-3">
          <div className="text-xs text-gray-400">TOTAL FLEET</div>
          <div className="text-2xl font-bold text-green-400">{TOTAL_DRONES.toLocaleString()}</div>
        </div>
        <div className="border-2 border-blue-500 bg-black/70 p-3">
          <div className="text-xs text-gray-400">BIG DRONES (33.3%)</div>
          <div className="text-2xl font-bold text-blue-400">{BIG_DRONES.toLocaleString()}</div>
        </div>
        <div className="border-2 border-yellow-500 bg-black/70 p-3">
          <div className="text-xs text-gray-400">MEDIUM (33.3%)</div>
          <div className="text-2xl font-bold text-yellow-400">{MEDIUM_DRONES.toLocaleString()}</div>
        </div>
        <div className="border-2 border-orange-500 bg-black/70 p-3">
          <div className="text-xs text-gray-400">MINI DRONES (33.3%)</div>
          <div className="text-2xl font-bold text-orange-400">{MINI_DRONES.toLocaleString()}</div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('operations')}
          className={`px-6 py-2 border-2 font-bold ${activeTab === 'operations' ? 'bg-green-600 border-green-400 text-black' : 'bg-black/50 border-green-600 text-green-400'}`}
        >
          OPERATIONS
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-6 py-2 border-2 font-bold ${activeTab === 'maintenance' ? 'bg-yellow-600 border-yellow-400 text-black' : 'bg-black/50 border-yellow-600 text-yellow-400'}`}
        >
          MAINTENANCE
        </button>
      </div>

      {activeTab === 'operations' && (
        <div className="grid grid-cols-3 gap-4">
          <div className="border-2 border-green-600 bg-black/70 p-4">
            <h2 className="text-xl font-bold mb-4 text-green-400">⚡ DEPLOYMENT CONTROL</h2>
            
            <div className="mb-4">
              <label className="block text-sm mb-2 text-gray-400">DEPLOYMENT MODE</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeploymentMode('autonomous')}
                  className={`flex-1 py-2 border-2 font-bold ${
                    deploymentMode === 'autonomous'
                      ? 'bg-blue-600 border-blue-400 text-black'
                      : 'bg-gray-800 border-gray-600 text-gray-400'
                  }`}
                >
                  {deploymentMode === 'autonomous' ? '✓ ' : ''}AUTONOMOUS
                </button>
                <button
                  onClick={() => setDeploymentMode('manual')}
                  className={`flex-1 py-2 border-2 font-bold ${
                    deploymentMode === 'manual'
                      ? 'bg-yellow-600 border-yellow-400 text-black'
                      : 'bg-gray-800 border-gray-600 text-gray-400'
                  }`}
                >
                  {deploymentMode === 'manual' ? '✓ ' : ''}MANUAL
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-2 text-gray-400">DRONE TYPE</label>
              <select
                value={selectedDroneType}
                onChange={(e) => setSelectedDroneType(e.target.value)}
                className="w-full bg-gray-800 border-2 border-green-600 text-green-400 p-2"
              >
                <option value="all">ALL TYPES</option>
                <option value="big">BIG DRONES</option>
                <option value="medium">MEDIUM DRONES</option>
                <option value="mini">MINI DRONES</option>
              </select>
            </div>

            {(selectedDroneType === 'big' || selectedDroneType === 'medium' || selectedDroneType === 'all') && (
              <div className="mb-4">
                <label className="block text-sm mb-2 text-gray-400">
                  WEAPON/MISSION TYPE {selectedDroneType === 'all' && '(BIG/MEDIUM)'} <span className="text-xs text-blue-400">[MULTI-SELECT]</span>
                </label>
                <div className="bg-gray-800 border-2 border-red-600 p-2 max-h-40 overflow-y-auto">
                  {weaponOptions.map(opt => {
                    const isSelected = selectedWeaponTypes.includes(opt.value);
                    return (
                      <div key={opt.value} className="mb-1">
                        <div
                          onClick={() => toggleWeaponType(opt.value, isSelected, false)}
                          className={`cursor-pointer p-2 border ${isSelected ? 'bg-red-900/50 border-red-400 text-red-400' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-red-600'}`}
                        >
                          {isSelected ? '✓ ' : ''}{opt.label}
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-2 mt-1 ml-4 p-2 bg-gray-900/50 border border-red-600/50">
                            <span className="text-xs text-gray-400">QTY:</span>
                            <input
                              type="number"
                              min="1"
                              value={weaponQuantities[opt.value] || 100}
                              onChange={(e) => updateWeaponQuantity(opt.value, parseInt(e.target.value) || 1)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-24 bg-gray-800 border border-red-600 text-red-400 p-1 text-sm"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className={`mt-2 p-2 border ${selectedDroneType === 'all' ? (isDeploymentValid ? 'border-green-600 bg-green-900/20' : 'border-yellow-600 bg-yellow-900/20') : (bigMediumTotal === deploymentCount ? 'border-green-600 bg-green-900/20' : 'border-yellow-600 bg-yellow-900/20')}`}>
                  <span className={`text-xs ${selectedDroneType === 'all' ? (isDeploymentValid ? 'text-green-400' : 'text-yellow-400') : (bigMediumTotal === deploymentCount ? 'text-green-400' : 'text-yellow-400')}`}>
                    {selectedDroneType === 'all' 
                      ? `COMBINED TOTAL: ${combinedTotal.toLocaleString()} / ${deploymentCount.toLocaleString()} ${isDeploymentValid ? '✓' : '⚠ MISMATCH'}`
                      : `TOTAL: ${bigMediumTotal.toLocaleString()} / ${deploymentCount.toLocaleString()} ${bigMediumTotal === deploymentCount ? '✓' : '⚠ MISMATCH'}`
                    }
                  </span>
                </div>
              </div>
            )}

            {(selectedDroneType === 'mini' || selectedDroneType === 'all') && (
              <div className="mb-4">
                <label className="block text-sm mb-2 text-gray-400">
                  WEAPON/MISSION TYPE (MINI) <span className="text-xs text-blue-400">[MULTI-SELECT]</span>
                </label>
                <div className="bg-gray-800 border-2 border-purple-600 p-2 max-h-40 overflow-y-auto">
                  {miniWeaponOptions.map(opt => {
                    const isSelected = selectedMiniWeaponTypes.includes(opt.value);
                    return (
                      <div key={opt.value} className="mb-1">
                        <div
                          onClick={() => toggleWeaponType(opt.value, isSelected, true)}
                          className={`cursor-pointer p-2 border ${isSelected ? 'bg-purple-900/50 border-purple-400 text-purple-400' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-purple-600'}`}
                        >
                          {isSelected ? '✓ ' : ''}{opt.label}
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-2 mt-1 ml-4 p-2 bg-gray-900/50 border border-purple-600/50">
                            <span className="text-xs text-gray-400">QTY:</span>
                            <input
                              type="number"
                              min="1"
                              value={weaponQuantities[opt.value] || 100}
                              onChange={(e) => updateWeaponQuantity(opt.value, parseInt(e.target.value) || 1)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-24 bg-gray-800 border border-purple-600 text-purple-400 p-1 text-sm"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className={`mt-2 p-2 border ${selectedDroneType === 'all' ? (isDeploymentValid ? 'border-green-600 bg-green-900/20' : 'border-yellow-600 bg-yellow-900/20') : (miniTotal === deploymentCount ? 'border-green-600 bg-green-900/20' : 'border-yellow-600 bg-yellow-900/20')}`}>
                  <span className={`text-xs ${selectedDroneType === 'all' ? (isDeploymentValid ? 'text-green-400' : 'text-yellow-400') : (miniTotal === deploymentCount ? 'text-green-400' : 'text-yellow-400')}`}>
                    {selectedDroneType === 'all' 
                      ? `COMBINED TOTAL: ${combinedTotal.toLocaleString()} / ${deploymentCount.toLocaleString()} ${isDeploymentValid ? '✓' : '⚠ MISMATCH'}`
                      : `TOTAL: ${miniTotal.toLocaleString()} / ${deploymentCount.toLocaleString()} ${miniTotal === deploymentCount ? '✓' : '⚠ MISMATCH'}`
                    }
                  </span>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm mb-2 text-gray-400">DEPLOYMENT COUNT</label>
              <input
                type="number"
                value={deploymentCount}
                onChange={(e) => setDeploymentCount(parseInt(e.target.value))}
                className="w-full bg-gray-800 border-2 border-green-600 text-green-400 p-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-2 text-gray-400">TARGET COORDINATES</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Latitude"
                  value={targetLat}
                  onChange={(e) => setTargetLat(e.target.value)}
                  className="flex-1 bg-gray-800 border-2 border-green-600 text-green-400 p-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Longitude"
                  value={targetLon}
                  onChange={(e) => setTargetLon(e.target.value)}
                  className="flex-1 bg-gray-800 border-2 border-green-600 text-green-400 p-2 text-sm"
                />
              </div>
            </div>

            <button
              onClick={deployDrones}
              disabled={!isDeploymentValid}
              className={`w-full font-bold py-3 border-2 ${
                isDeploymentValid 
                  ? 'bg-red-600 hover:bg-red-700 text-white border-red-400 animate-pulse cursor-pointer' 
                  : 'bg-gray-700 text-gray-400 border-gray-500 cursor-not-allowed'
              }`}
            >
              {isDeploymentValid 
                ? `🚀 DEPLOY DRONES ${deploymentMode === 'autonomous' ? '(AUTO)' : '(MANUAL)'}` 
                : '⚠️ WEAPON QUANTITIES MUST MATCH DEPLOYMENT COUNT'}
            </button>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveDrones([])}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 border-2 border-orange-400"
              >
                🗑️ CLEAR ALL
              </button>
              <button
                onClick={() => setActiveDrones(prev => prev.filter(d => d.status !== 'deployed' && d.status !== 'eliminated' && d.status !== 'terminated'))}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 border-2 border-yellow-400"
              >
                CLEAR DEPLOYED
              </button>
            </div>

            <div className="mt-2">
              <select
                onChange={(e) => {
                  const type = e.target.value;
                  if (type === 'all') {
                    setActiveDrones([]);
                  } else {
                    setActiveDrones(prev => prev.filter(d => d.type !== type));
                  }
                  e.target.value = '';
                }}
                className="w-full bg-gray-800 border-2 border-orange-600 text-orange-400 p-2 text-sm"
                defaultValue=""
              >
                <option value="" disabled>CLEAR BY TYPE...</option>
                <option value="Big">Clear Big Drones</option>
                <option value="Medium">Clear Medium Drones</option>
                <option value="Mini-Return">Clear Mini-Return</option>
                <option value="Mini-Kamikaze">Clear Mini-Kamikaze</option>
                <option value="all">Clear All Types</option>
              </select>
            </div>

            <div className="mt-6 pt-4 border-t-2 border-gray-700">
              <h3 className="font-bold mb-2 text-yellow-400">FLEET STATUS</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-red-500">● DEPLOYED:</span> <span>{droneStats.deployed.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-blue-400">● IN TRANSIT:</span> <span>{droneStats.inTransit.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-orange-400">● RETURNING:</span> <span>{droneStats.returning.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-red-600">● ENGAGING:</span> <span>{droneStats.engaging.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-green-400">● AT BASE:</span> <span>{droneStats.atBase.toLocaleString()}</span></div>
              </div>
            </div>
          </div>

          <div className="col-span-2 border-2 border-green-600 bg-black/70 p-4">
            <h2 className="text-xl font-bold mb-4 text-green-400">📡 TACTICAL MAP - GPS TRACKING</h2>
            
            <div className="h-96 mb-4">
              <TacticalMap 
                drones={activeDrones}
                targetLat={targetLat}
                targetLon={targetLon}
              />
            </div>

            <div className="border-2 border-green-800 bg-gray-900 p-3 max-h-64 overflow-y-auto">
              <h3 className="font-bold mb-2 text-yellow-400">ACTIVE DRONES</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-1">ID</th>
                    <th className="text-left p-1">TYPE</th>
                    <th className="text-left p-1">STATUS</th>
                    <th className="text-left p-1">LAT</th>
                    <th className="text-left p-1">LON</th>
                    <th className="text-left p-1">BAT%</th>
                  </tr>
                </thead>
                <tbody>
                  {activeDrones.map(drone => (
                    <tr key={drone.id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="p-1">#{drone.id}</td>
                      <td className="p-1">{drone.type}</td>
                      <td className={`p-1 ${getStatusColor(drone.status)}`}>{drone.status.toUpperCase()}</td>
                      <td className="p-1">{drone.lat.toFixed(4)}</td>
                      <td className="p-1">{drone.lon.toFixed(4)}</td>
                      <td className="p-1">
                        <span className={drone.battery < 30 ? 'text-red-500' : 'text-green-400'}>
                          {drone.battery}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="border-2 border-yellow-600 bg-black/70 p-4">
            <h2 className="text-xl font-bold mb-4 text-yellow-400 flex items-center gap-2">
              <Wrench size={24} /> MAINTENANCE STATUS
            </h2>
            
            <div className="space-y-4">
              <div className="border-2 border-orange-500 bg-gray-900 p-3">
                <div className="text-sm text-gray-400">IN MAINTENANCE</div>
                <div className="text-3xl font-bold text-orange-400">{maintenanceData.inMaintenance.toLocaleString()}</div>
              </div>
              
              <div className="border-2 border-green-500 bg-gray-900 p-3">
                <div className="text-sm text-gray-400">REPAIRED (TOTAL)</div>
                <div className="text-3xl font-bold text-green-400">{maintenanceData.repaired.toLocaleString()}</div>
              </div>
              
              <div className="border-2 border-red-500 bg-gray-900 p-3">
                <div className="text-sm text-gray-400">DAMAGED/AWAITING REPAIR</div>
                <div className="text-3xl font-bold text-red-400">{maintenanceData.damaged.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="border-2 border-blue-600 bg-black/70 p-4">
            <h2 className="text-xl font-bold mb-4 text-blue-400 flex items-center gap-2">
              <ShoppingCart size={24} /> PROCUREMENT & UPDATES
            </h2>
            
            <div className="space-y-4">
              <div className="border-2 border-blue-500 bg-gray-900 p-3">
                <div className="text-sm text-gray-400">NEW PURCHASES</div>
                <div className="text-3xl font-bold text-blue-400">{maintenanceData.newPurchases.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">Units ordered this quarter</div>
              </div>
              
              <div className="border-2 border-purple-500 bg-gray-900 p-3">
                <div className="text-sm text-gray-400">SCHEDULED UPDATES</div>
                <div className="text-3xl font-bold text-purple-400">{maintenanceData.scheduledUpdates.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">Firmware v4.2.1 rollout</div>
              </div>
              
              <div className="border-2 border-yellow-500 bg-gray-900 p-3">
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <Battery size={16} />
                  LOW BATTERY ALERTS
                </div>
                <div className="text-3xl font-bold text-yellow-400">{droneStats.lowBattery.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">Require immediate charging</div>
              </div>
            </div>
          </div>

          <div className="col-span-2 border-2 border-green-600 bg-black/70 p-4">
            <h2 className="text-xl font-bold mb-4 text-green-400 flex items-center gap-2">
              <TrendingUp size={24} /> FLEET HEALTH REPORT
            </h2>
            
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-gray-900 p-3 border-l-4 border-green-500">
                <div className="text-xs text-gray-400">OPERATIONAL</div>
                <div className="text-xl font-bold text-green-400">98.2%</div>
              </div>
              <div className="bg-gray-900 p-3 border-l-4 border-yellow-500">
                <div className="text-xs text-gray-400">MAINTENANCE RATE</div>
                <div className="text-xl font-bold text-yellow-400">0.4%</div>
              </div>
              <div className="bg-gray-900 p-3 border-l-4 border-red-500">
                <div className="text-xs text-gray-400">DAMAGE RATE</div>
                <div className="text-xl font-bold text-red-400">0.2%</div>
              </div>
              <div className="bg-gray-900 p-3 border-l-4 border-blue-500">
                <div className="text-xs text-gray-400">AVG BATTERY</div>
                <div className="text-xl font-bold text-blue-400">87%</div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-900 border border-gray-700">
              <div className="text-sm text-gray-400 mb-2">RECENT MAINTENANCE LOG</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-gray-800 pb-1">
                  <span>Drone #45123789 - Battery replacement</span>
                  <span className="text-green-400">COMPLETED</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-1">
                  <span>Drone #78234567 - Motor repair</span>
                  <span className="text-yellow-400">IN PROGRESS</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-1">
                  <span>Drone #12345678 - Firmware update v4.2.1</span>
                  <span className="text-green-400">COMPLETED</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span>Batch update: 50,000 units - Software patch</span>
                  <span className="text-blue-400">SCHEDULED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
