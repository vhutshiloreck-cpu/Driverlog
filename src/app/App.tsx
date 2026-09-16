"use client";

import { useEffect, useMemo, useState } from "react";

type View = "home" | "trips" | "expenses" | "vehicles" | "reports" | "maintenance" | "settings";
type Trip = {
  id: string;
  type: "business" | "personal";
  from: string;
  to: string;
  km: number;
  minutes: number;
  date: string;
  vehicle: string;
};

type Expense = {
  id: string;
  category: string;
  merchant: string;
  amount: number;
  date: string;
};

type Vehicle = {
  id: string;
  make: string;
  model: string;
  plate: string;
  odometer: number;
  fuel: string;
  primary?: boolean;
};

const seedVehicles: Vehicle[] = [
  { id: "v1", make: "Volkswagen", model: "Polo", plate: "DEM-001", odometer: 85240, fuel: "Petrol", primary: true },
  { id: "v2", make: "Toyota", model: "Hilux", plate: "WRK-774", odometer: 142300, fuel: "Diesel" },
];

const seedTrips: Trip[] = [
  { id: "t1", type: "business", from: "Sandton", to: "Midrand", km: 32.4, minutes: 48, date: "2026-09-15", vehicle: "v1" },
  { id: "t2", type: "personal", from: "Home", to: "Rosebank Mall", km: 11.2, minutes: 25, date: "2026-09-14", vehicle: "v1" },
  { id: "t3", type: "business", from: "Office", to: "Pretoria CBD", km: 54.1, minutes: 70, date: "2026-09-12", vehicle: "v1" },
];

const seedExpenses: Expense[] = [
  { id: "e1", category: "fuel", merchant: "Engen 1Stop", amount: 920, date: "2026-09-15" },
  { id: "e2", category: "parking", merchant: "Sandton City", amount: 45, date: "2026-09-14" },
  { id: "e3", category: "maintenance", merchant: "Tiger Wheel & Tyre", amount: 310, date: "2026-09-12" },
];

const money = (value: number) => `R${value.toLocaleString("en-ZA", { minimumFractionDigits:0, maximumFractionDigits: 2 })}`;
const formatDate = (value: string) => new Date(value).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });

function App() {
  const [view, setView] = useState<View>("home");
  const [vehicles, setVehicles] = useState<Vehicle[]>(seedVehicles);
  const [trips, setTrips] = useState<Trip[]>(seedTrips);
  const [expenses, setExpenses] = useState<Expense[]>(seedExpenses);
  const [showTripModal, setShowTripModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [driveOn, setDriveOn] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("driverlog-app");
      if (!raw) return;
      const parsed = JSON.parse(raw) as { vehicles?: Vehicle[]; trips?: Trip[]; expenses?: Expense[] };
      if (parsed.vehicles) setVehicles(parsed.vehicles);
      if (parsed.trips) setTrips(parsed.trips);
      if (parsed.expenses) setExpenses(parsed.expenses);
    } catch {
      // Ignore malformed local storage data.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("driverlog-app", JSON.stringify({ vehicles, trips, expenses }));
  }, [vehicles, trips, expenses]);

  const primaryVehicle = useMemo(
    () => vehicles.find((v) => v.primary) ?? vehicles[0],
    [vehicles],
  );

  const distanceThisMonth = trips.reduce((total, trip) => total + trip.km, 0);
  const totalSpend = expenses.reduce((total, expense) => total + expense.amount, 0);
  const businessKm = trips.filter((trip) => trip.type === "business").reduce((total, trip) => total + trip.km, 0);

  const renderContent = () => {
    switch (view) {
      case "home":
        return (
          <HomeView
            primaryVehicle={primaryVehicle}
            trips={trips}
            expenses={expenses}
            totalSpend={totalSpend}
            distanceThisMonth={distanceThisMonth}
            businessKm={businessKm}
            setView={setView}
            onAddTrip={() => setShowTripModal(true)}
            onAddExpense={() => setShowExpenseModal(true)}
            onStartDrive={() => setDriveOn(true)}
          />
        );
      case "trips":
        return <TripsView trips={trips} onAddTrip={() => setShowTripModal(true)} />;
      case "expenses":
        return <ExpensesView expenses={expenses} onAddExpense={() => setShowExpenseModal(true)} />;
      case "vehicles":
        return <VehiclesView vehicles={vehicles} />;
      case "reports":
        return <ReportsView trips={trips} expenses={expenses} />;
      case "maintenance":
        return <MaintenanceView primaryVehicle={primaryVehicle} />;
      case "settings":
        return <SettingsView />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="app-shell">
        <aside className="sidebar glass-panel">
          <div className="brand-block">
            <div className="brand-mark">D</div>
            <div>
              <div className="brand-name">DriverLog</div>
              <div className="brand-tag">Drive. Track. Know.</div>
            </div>
          </div>

          <button className="primary-btn full-width" onClick={() => setDriveOn(true)}>
            Start drive
          </button>

          <nav className="nav-list">
            {[
              ["home", "Home"],
              ["trips", "Trips"],
              ["expenses", "Expenses"],
              ["vehicles", "Garage"],
              ["reports", "Reports"],
              ["maintenance", "Maintenance"],
              ["settings", "Settings"],
            ].map(([key, label]) => (
              <button
                key={key}
                className={view === key ? "nav-item active" : "nav-item"}
                onClick={() => setView(key as View)}
              >
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="main-panel">
          {renderContent()}
        </main>
      </div>

      <div className="mobile-bar">
        {["home", "trips", "expenses", "vehicles"].map((key) => (
          <button key={key} className={view === key ? "mobile-item active" : "mobile-item"} onClick={() => setView(key as View)}>
            {key}
          </button>
        ))}
        <button className="mobile-drive" onClick={() => setDriveOn(true)}>Drive</button>
      </div>

      {driveOn && (
        <DriveModal
          onClose={() => setDriveOn(false)}
          onSave={(newTrip) => {
            setTrips((previous) => [newTrip, ...previous]);
            setDriveOn(false);
            setView("trips");
          }}
          vehicle={primaryVehicle}
        />
      )}

      {showTripModal && (
        <AddTripModal
          onClose={() => setShowTripModal(false)}
          onSave={(newTrip) => {
            setTrips((previous) => [newTrip, ...previous]);
            setShowTripModal(false);
          }}
        />
      )}

      {showExpenseModal && (
        <AddExpenseModal
          onClose={() => setShowExpenseModal(false)}
          onSave={(newExpense) => {
            setExpenses((previous) => [newExpense, ...previous]);
            setShowExpenseModal(false);
          }}
        />
      )}
    </>
  );
}

function HomeView({
  primaryVehicle,
  trips,
  expenses,
  totalSpend,
  distanceThisMonth,
  businessKm,
  setView,
  onAddTrip,
  onAddExpense,
  onStartDrive,
}: {
  primaryVehicle?: Vehicle;
  trips: Trip[];
  expenses: Expense[];
  totalSpend: number;
  distanceThisMonth: number;
  businessKm: number;
  setView: (view: View) => void;
  onAddTrip: () => void;
  onAddExpense: () => void;
  onStartDrive: () => void;
}) {
  return (
    <>
      <div className="header-row">
        <div>
          <div className="eyebrow">Good day</div>
          <h1>Keep moving.</h1>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={onStartDrive}>Start drive</button>
          <button className="secondary-btn" onClick={onAddTrip}>Add trip</button>
          <button className="primary-btn" onClick={onAddExpense}>Add expense</button>
        </div>
      </div>

      <section className="stats-grid">
        <StatCard title="Distance this month" value={`${distanceThisMonth.toFixed(1)} km`} accent />
        <StatCard title="Total spend" value={money(totalSpend)} />
        <StatCard title="Business km" value={`${businessKm.toFixed(1)} km`} />
        <StatCard title="Trips logged" value={String(trips.length)} />
      </section>

      <div className="content-grid two-col">
        <div className="panel glass-panel">
          <div className="panel-header">
            <h2>Primary vehicle</h2>
            <button className="text-btn" onClick={() => setView("vehicles")}>View all</button>
          </div>
          {primaryVehicle ? (
            <div className="vehicle-highlight">
              <div>
                <strong>{primaryVehicle.make} {primaryVehicle.model}</strong>
                <div className="subtle">{primaryVehicle.plate} · {primaryVehicle.fuel}</div>
              </div>
              <span className="pill">{primaryVehicle.odometer.toLocaleString()} km</span>
            </div>
          ) : (
            <div className="empty-state">No vehicle set yet.</div>
          )}
        </div>

        <div className="panel glass-panel">
          <div className="panel-header">
            <h2>Expense snapshot</h2>
            <button className="text-btn" onClick={() => setView("expenses")}>Details</button>
          </div>
          <div className="stack-list">
            {expenses.slice(0, 3).map((expense) => (
              <div key={expense.id} className="list-row">
                <div>
                  <strong>{expense.merchant}</strong>
                  <div className="subtle">{expense.category}</div>
                </div>
                <span>{money(expense.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel glass-panel">
        <div className="panel-header">
          <h2>Recent trips</h2>
          <button className="text-btn" onClick={() => setView("trips")}>View all</button>
        </div>
        <div className="stack-list">
          {trips.slice(0, 4).map((trip) => (
            <div key={trip.id} className="list-row">
              <div>
                <strong>{trip.from} → {trip.to}</strong>
                <div className="subtle">{trip.type} · {formatDate(trip.date)} · {trip.minutes} min</div>
              </div>
              <span>{trip.km.toFixed(1)} km</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function TripsView({ trips, onAddTrip }: { trips: Trip[]; onAddTrip: () => void }) {
  return (
    <>
      <div className="header-row">
        <div>
          <div className="eyebrow">Trips</div>
          <h1>Journeys</h1>
        </div>
        <button className="primary-btn" onClick={onAddTrip}>Add trip</button>
      </div>
      <div className="stack-list">
        {trips.length === 0 ? (
          <div className="empty-state">No trips added yet.</div>
        ) : (
          trips.map((trip) => (
            <div key={trip.id} className="list-row large panel-card">
              <div>
                <strong>{trip.from} → {trip.to}</strong>
                <div className="subtle">{trip.type} · {formatDate(trip.date)} · {trip.minutes} min</div>
              </div>
              <span>{trip.km.toFixed(1)} km</span>
            </div>
          ))
        )}
      </div>
    </>
  );
}

function ExpensesView({ expenses, onAddExpense }: { expenses: Expense[]; onAddExpense: () => void }) {
  return (
    <>
      <div className="header-row">
        <div>
          <div className="eyebrow">Costs</div>
          <h1>Expenses</h1>
        </div>
        <button className="primary-btn" onClick={onAddExpense}>Add expense</button>
      </div>
      <div className="stack-list">
        {expenses.length === 0 ? (
          <div className="empty-state">No costs recorded.</div>
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} className="list-row large panel-card">
              <div>
                <strong>{expense.merchant}</strong>
                <div className="subtle">{expense.category} · {formatDate(expense.date)}</div>
              </div>
              <span>{money(expense.amount)}</span>
            </div>
          ))
        )}
      </div>
    </>
  );
}

function VehiclesView({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <>
      <div className="header-row">
        <div>
          <div className="eyebrow">Garage</div>
          <h1>Vehicles</h1>
        </div>
      </div>
      <div className="stack-list">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="panel-card panel">
            <div className="list-row">
              <div>
                <strong>{vehicle.make} {vehicle.model}</strong>
                <div className="subtle">{vehicle.plate} · {vehicle.fuel}</div>
              </div>
              {vehicle.primary ? <span className="pill">Primary</span> : null}
            </div>
            <div className="vehicle-stats">
              <span>{vehicle.odometer.toLocaleString()} km</span>
              <span>{vehicle.primary ? "Active" : "Backup"}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ReportsView({ trips, expenses }: { trips: Trip[]; expenses: Expense[] }) {
  const totalDistance = trips.reduce((total, trip) => total + trip.km, 0);
  const spend = expenses.reduce((total, expense) => total + expense.amount, 0);

  return (
    <>
      <div className="header-row">
        <div>
          <div className="eyebrow">Insights</div>
          <h1>Reports</h1>
        </div>
      </div>

      <section className="stats-grid">
        <StatCard title="Total distance" value={`${totalDistance.toFixed(1)} km`} accent />
        <StatCard title="Total spend" value={money(spend)} />
        <StatCard title="Trips" value={String(trips.length)} />
        <StatCard title="Avg. trip" value={`${(totalDistance / Math.max(trips.length, 1)).toFixed(1)} km`} />
      </section>

      <div className="panel glass-panel">
        <div className="panel-header">
          <h2>Distance trend</h2>
        </div>
        <div className="bar-chart">
          {trips.slice(0, 6).map((trip) => (
            <div key={trip.id} className="bar-wrap">
              <div className="bar" style={{ height: `${Math.max(24, (trip.km / Math.max(60, totalDistance || 1)) * 100)}%` }} />
              <small>{trip.km.toFixed(0)}</small>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function MaintenanceView({ primaryVehicle }: { primaryVehicle?: Vehicle }) {
  return (
    <>
      <div className="header-row">
        <div>
          <div className="eyebrow">Maintenance</div>
          <h1>Service schedule</h1>
        </div>
      </div>

      <section className="stats-grid">
        <StatCard title="Primary vehicle" value={primaryVehicle ? `${primaryVehicle.make} ${primaryVehicle.model}` : "—"} />
        <StatCard title="Next service" value={primaryVehicle ? `${(primaryVehicle.odometer + 15000).toLocaleString()} km` : "—"} accent />
        <StatCard title="Insurance" value="42 days" />
        <StatCard title="License" value="87 days" />
      </section>
    </>
  );
}

function SettingsView() {
  return (
    <>
      <div className="header-row">
        <div>
          <div className="eyebrow">Preferences</div>
          <h1>Settings</h1>
        </div>
      </div>

      <div className="panel glass-panel form-stack">
        <label>
          <span>Display name</span>
          <input defaultValue="Driver" />
        </label>
        <label>
          <span>Distance unit</span>
          <select defaultValue="kilometres">
            <option value="kilometres">Kilometres</option>
            <option value="miles">Miles</option>
          </select>
        </label>
        <label>
          <span>Currency</span>
          <select defaultValue="zar">
            <option value="zar">ZAR</option>
            <option value="usd">USD</option>
          </select>
        </label>
      </div>
    </>
  );
}

function DriveModal({
  vehicle,
  onClose,
  onSave,
}: {
  vehicle?: Vehicle;
  onClose: () => void;
  onSave: (trip: Trip) => void;
}) {
  const [destination, setDestination] = useState("Pretoria CBD");
  const [minutes, setMinutes] = useState(40);
  const [km, setKm] = useState(28.4);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card glass-panel" onClick={(event) => event.stopPropagation()}>
        <div className="panel-header">
          <h2>Start drive</h2>
          <button className="text-btn" onClick={onClose}>Close</button>
        </div>

        <div className="form-stack">
          <label>
            <span>Vehicle</span>
            <input value={vehicle ? `${vehicle.make} ${vehicle.model}` : "No vehicle selected"} readOnly />
          </label>
          <label>
            <span>Destination</span>
            <input value={destination} onChange={(event) => setDestination(event.target.value)} />
          </label>
          <div className="split-form">
            <label>
              <span>Distance (km)</span>
              <input type="number" value={km} onChange={(event) => setKm(Number(event.target.value))} />
            </label>
            <label>
              <span>Duration (min)</span>
              <input type="number" value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} />
            </label>
          </div>
        </div>

        <div className="modal-actions">
          <button className="secondary-btn" onClick={onClose}>Cancel</button>
          <button
            className="primary-btn"
            onClick={() =>
              onSave({
                id: crypto.randomUUID(),
                type: "business",
                from: "Current location",
                to: destination,
                km,
                minutes,
                date: new Date().toISOString().slice(0, 10),
                vehicle: vehicle?.id ?? "v1",
              })
            }
          >
            Save trip
          </button>
        </div>
      </div>
    </div>
  );
}

function AddTripModal({ onClose, onSave }: { onClose: () => void; onSave: (trip: Trip) => void }) {
  const [from, setFrom] = useState("Sandton");
  const [to, setTo] = useState("Midrand");
  const [km, setKm] = useState(32.4);
  const [minutes, setMinutes] = useState(48);
  const [type, setType] = useState<"business" | "personal">("business");

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card glass-panel" onClick={(event) => event.stopPropagation()}>
        <div className="panel-header">
          <h2>Add trip</h2>
          <button className="text-btn" onClick={onClose}>Close</button>
        </div>
        <div className="form-stack">
          <label>
            <span>Type</span>
            <select value={type} onChange={(event) => setType(event.target.value as "business" | "personal")}>
              <option value="business">Business</option>
              <option value="personal">Personal</option>
            </select>
          </label>
          <div className="split-form">
            <label>
              <span>From</span>
              <input value={from} onChange={(event) => setFrom(event.target.value)} />
            </label>
            <label>
              <span>To</span>
              <input value={to} onChange={(event) => setTo(event.target.value)} />
            </label>
          </div>
          <div className="split-form">
            <label>
              <span>Distance (km)</span>
              <input type="number" value={km} onChange={(event) => setKm(Number(event.target.value))} />
            </label>
            <label>
              <span>Minutes</span>
              <input type="number" value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} />
            </label>
          </div>
        </div>
        <div className="modal-actions">
          <button className="secondary-btn" onClick={onClose}>Cancel</button>
          <button
            className="primary-btn"
            onClick={() =>
              onSave({
                id: crypto.randomUUID(),
                type,
                from,
                to,
                km,
                minutes,
                date: new Date().toISOString().slice(0, 10),
                vehicle: "v1",
              })
            }
          >
            Save trip
          </button>
        </div>
      </div>
    </div>
  );
}

function AddExpenseModal({ onClose, onSave }: { onClose: () => void; onSave: (expense: Expense) => void }) {
  const [category, setCategory] = useState("fuel");
  const [merchant, setMerchant] = useState("Engen 1Stop");
  const [amount, setAmount] = useState(920);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card glass-panel" onClick={(event) => event.stopPropagation()}>
        <div className="panel-header">
          <h2>Add expense</h2>
          <button className="text-btn" onClick={onClose}>Close</button>
        </div>
        <div className="form-stack">
          <label>
            <span>Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="fuel">Fuel</option>
              <option value="parking">Parking</option>
              <option value="maintenance">Maintenance</option>
              <option value="insurance">Insurance</option>
            </select>
          </label>
          <label>
            <span>Merchant</span>
            <input value={merchant} onChange={(event) => setMerchant(event.target.value)} />
          </label>
          <label>
            <span>Amount</span>
            <input type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
          </label>
        </div>
        <div className="modal-actions">
          <button className="secondary-btn" onClick={onClose}>Cancel</button>
          <button
            className="primary-btn"
            onClick={() =>
              onSave({
                id: crypto.randomUUID(),
                category,
                merchant,
                amount,
                date: new Date().toISOString().slice(0, 10),
              })
            }
          >
            Save expense
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, accent = false }: { title: string; value: string; accent?: boolean }) {
  return (
    <div className={accent ? "metric-card accent" : "metric-card"}>
      <div className="metric-title">{title}</div>
      <div className="metric-value">{value}</div>
    </div>
  );
}

export { App };
