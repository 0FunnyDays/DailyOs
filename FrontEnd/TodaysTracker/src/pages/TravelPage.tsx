import { useMemo, useState } from "react";
import type { TravelTrip } from "../types";

type TravelTripUpdates = Partial<
  Pick<
    TravelTrip,
    | "name"
    | "startDate"
    | "endDate"
    | "estimatedExpenses"
    | "actualExpenses"
    | "ticketPrice"
    | "plansNote"
    | "remindersNote"
  >
>;

type TravelPageProps = {
  trips: TravelTrip[];
  currency: string;
  onAddTrip: (name: string) => void;
  onUpdateTrip: (tripId: string, updates: TravelTripUpdates) => void;
  onSetTripFinished: (tripId: string, isFinished: boolean) => void;
};

function hasText(value: string | undefined | null): boolean {
  return Boolean(value && value.trim());
}

function parseMoneyInput(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const normalized = trimmed.replace(",", ".");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.max(0, Math.round(parsed * 100) / 100);
}

function formatMoney(currency: string, amount: number | undefined): string {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return "—";
  return `${currency}${amount.toFixed(2)}`;
}

function formatIsoDate(iso: string | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function computeTripDays(startDate?: string, endDate?: string): number | null {
  if (!startDate || !endDate) return null;
  const [sy, sm, sd] = startDate.split("-").map(Number);
  const [ey, em, ed] = endDate.split("-").map(Number);
  const start = new Date(sy, (sm || 1) - 1, sd || 1);
  const end = new Date(ey, (em || 1) - 1, ed || 1);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const diffMs = end.getTime() - start.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return days > 0 ? days : null;
}

function sortTrips(trips: TravelTrip[]): TravelTrip[] {
  return [...trips].sort((a, b) => {
    if (a.isFinished !== b.isFinished) return a.isFinished ? 1 : -1;
    const aDate = a.startDate || "";
    const bDate = b.startDate || "";
    if (aDate !== bDate) return aDate > bDate ? -1 : 1;
    return a.updatedAt > b.updatedAt ? -1 : 1;
  });
}

type TravelTripCardProps = {
  trip: TravelTrip;
  currency: string;
  onUpdateTrip: (tripId: string, updates: TravelTripUpdates) => void;
  onSetTripFinished: (tripId: string, isFinished: boolean) => void;
};

function TravelTripCard({
  trip,
  currency,
  onUpdateTrip,
  onSetTripFinished,
}: TravelTripCardProps) {
  const tripDays = computeTripDays(trip.startDate, trip.endDate);
  const estimatedTotal =
    (typeof trip.ticketPrice === "number" ? trip.ticketPrice : 0)
    + (typeof trip.estimatedExpenses === "number" ? trip.estimatedExpenses : 0);
  const actualTotal =
    (typeof trip.ticketPrice === "number" ? trip.ticketPrice : 0)
    + (typeof trip.actualExpenses === "number" ? trip.actualExpenses : 0);
  const hasEstimated =
    typeof trip.ticketPrice === "number" || typeof trip.estimatedExpenses === "number";
  const hasActual =
    typeof trip.ticketPrice === "number" || typeof trip.actualExpenses === "number";
  const variance =
    hasEstimated && hasActual ? Math.round((actualTotal - estimatedTotal) * 100) / 100 : null;

  return (
    <article className={`travel-page__card${trip.isFinished ? " travel-page__card--finished" : ""}`}>
      <div className="travel-page__card-head">
        <div className="travel-page__card-title-wrap">
          <input
            className="travel-page__name-input"
            type="text"
            maxLength={120}
            value={trip.name}
            onChange={(e) => onUpdateTrip(trip.id, { name: e.target.value })}
            aria-label="Trip name"
          />

          <div className="travel-page__meta-row">
            <span className={`travel-page__status${trip.isFinished ? " travel-page__status--done" : ""}`}>
              {trip.isFinished ? "Completed" : "Planned"}
            </span>
            <span className="travel-page__meta-text">Created {formatIsoDate(trip.createdAt)}</span>
            {trip.isFinished && (
              <span className="travel-page__meta-text">Finished {formatIsoDate(trip.finishedAt)}</span>
            )}
            {tripDays && <span className="travel-page__meta-text">{tripDays} day trip</span>}
          </div>
        </div>

        <button
          type="button"
          className={`travel-page__toggle-btn${trip.isFinished ? " travel-page__toggle-btn--reopen" : ""}`}
          onClick={() => onSetTripFinished(trip.id, !trip.isFinished)}
        >
          {trip.isFinished ? "Reopen Trip" : "Finish Trip"}
        </button>
      </div>

      <div className="travel-page__grid">
        <label className="home__field">
          <span className="home__field-label">From</span>
          <input
            className="home__field-input"
            type="date"
            value={trip.startDate ?? ""}
            onChange={(e) =>
              onUpdateTrip(trip.id, { startDate: e.target.value || undefined })
            }
          />
        </label>

        <label className="home__field">
          <span className="home__field-label">Until</span>
          <input
            className="home__field-input"
            type="date"
            value={trip.endDate ?? ""}
            onChange={(e) =>
              onUpdateTrip(trip.id, { endDate: e.target.value || undefined })
            }
          />
        </label>

        <label className="home__field">
          <span className="home__field-label">Ticket price</span>
          <input
            className="home__field-input"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={typeof trip.ticketPrice === "number" ? String(trip.ticketPrice) : ""}
            onChange={(e) =>
              onUpdateTrip(trip.id, { ticketPrice: parseMoneyInput(e.target.value) })
            }
          />
        </label>

        <label className="home__field">
          <span className="home__field-label">Estimated expenses</span>
          <input
            className="home__field-input"
            type="number"
            min="0"
            step="0.01"
            placeholder="What you expect to spend"
            value={
              typeof trip.estimatedExpenses === "number" ? String(trip.estimatedExpenses) : ""
            }
            onChange={(e) =>
              onUpdateTrip(trip.id, { estimatedExpenses: parseMoneyInput(e.target.value) })
            }
          />
        </label>

        <label className="home__field">
          <span className="home__field-label">Actual expenses</span>
          <input
            className="home__field-input"
            type="number"
            min="0"
            step="0.01"
            placeholder="After you return"
            value={typeof trip.actualExpenses === "number" ? String(trip.actualExpenses) : ""}
            onChange={(e) =>
              onUpdateTrip(trip.id, { actualExpenses: parseMoneyInput(e.target.value) })
            }
          />
        </label>

        <div className="travel-page__budget-summary" role="group" aria-label="Travel budget summary">
          <div className="travel-page__budget-pill">
            <span>Planned total</span>
            <strong>{hasEstimated ? formatMoney(currency, estimatedTotal) : "—"}</strong>
          </div>
          <div className="travel-page__budget-pill">
            <span>Actual total</span>
            <strong>{hasActual ? formatMoney(currency, actualTotal) : "—"}</strong>
          </div>
          <div className={`travel-page__budget-pill${variance !== null ? " travel-page__budget-pill--variance" : ""}`}>
            <span>Difference</span>
            <strong>
              {variance === null
                ? "—"
                : `${variance > 0 ? "+" : variance < 0 ? "-" : ""}${currency}${Math.abs(variance).toFixed(2)}`}
            </strong>
          </div>
        </div>
      </div>

      <div className="travel-page__notes-grid">
        <label className="home__field">
          <span className="home__field-label">What I want to do there</span>
          <textarea
            className="travel-page__textarea"
            rows={5}
            placeholder="Places, activities, food spots, plans..."
            value={trip.plansNote ?? ""}
            onChange={(e) =>
              onUpdateTrip(trip.id, { plansNote: e.target.value || undefined })
            }
          />
        </label>

        <label className="home__field">
          <span className="home__field-label">What I need to remember</span>
          <textarea
            className="travel-page__textarea"
            rows={5}
            placeholder="Documents, packing reminders, bookings, deadlines..."
            value={trip.remindersNote ?? ""}
            onChange={(e) =>
              onUpdateTrip(trip.id, { remindersNote: e.target.value || undefined })
            }
          />
        </label>
      </div>
    </article>
  );
}

export function TravelPage({
  trips,
  currency,
  onAddTrip,
  onUpdateTrip,
  onSetTripFinished,
}: TravelPageProps) {
  const [newTripName, setNewTripName] = useState("");

  const sorted = useMemo(() => sortTrips(trips), [trips]);
  const activeTrips = sorted.filter((trip) => !trip.isFinished);
  const finishedTrips = sorted.filter((trip) => trip.isFinished);

  function addTrip() {
    const trimmed = newTripName.trim();
    if (!trimmed) return;
    onAddTrip(trimmed);
    setNewTripName("");
  }

  return (
    <section className="page-renderer__section travel-page">
      <div className="travel-page__head">
        <div>
          <h1 className="page-renderer__title travel-page__title">Travel Planner</h1>
          <p className="page-renderer__subtitle travel-page__subtitle">
            Plan trips, track expected vs real travel costs, and keep your reminders in one place.
          </p>
        </div>

        <div className="travel-page__stats">
          <span className="travel-page__stat-chip">{activeTrips.length} active</span>
          <span className="travel-page__stat-chip">{finishedTrips.length} completed</span>
        </div>
      </div>

      <div className="travel-page__create">
        <div className="travel-page__create-head">
          <h2 className="travel-page__section-title">New Trip</h2>
          <span className="travel-page__hint">Start with a trip name / destination</span>
        </div>

        <form
          className="travel-page__create-form"
          onSubmit={(e) => {
            e.preventDefault();
            addTrip();
          }}
        >
          <input
            className="home__field-input"
            type="text"
            maxLength={120}
            placeholder="Trip name (e.g. Rome Summer Trip, Athens Weekend...)"
            value={newTripName}
            onChange={(e) => setNewTripName(e.target.value)}
            aria-label="New trip name"
          />
          <button
            type="submit"
            className="travel-page__create-btn"
            disabled={!hasText(newTripName)}
          >
            Add Trip
          </button>
        </form>
      </div>

      <div className="travel-page__section-block">
        <div className="travel-page__section-head">
          <h2 className="travel-page__section-title">Upcoming / Active Trips</h2>
          <span className="travel-page__hint">Dates, budget, ticket, plans, reminders</span>
        </div>

        {activeTrips.length === 0 ? (
          <div className="travel-page__empty">
            <p className="travel-page__empty-title">No trips yet.</p>
            <p className="travel-page__empty-text">
              Add a trip and start filling in dates, estimated expenses, and what you want to do.
            </p>
          </div>
        ) : (
          <div className="travel-page__list">
            {activeTrips.map((trip) => (
              <TravelTripCard
                key={trip.id}
                trip={trip}
                currency={currency}
                onUpdateTrip={onUpdateTrip}
                onSetTripFinished={onSetTripFinished}
              />
            ))}
          </div>
        )}
      </div>

      <div className="travel-page__section-block">
        <div className="travel-page__section-head">
          <h2 className="travel-page__section-title">Completed Trips</h2>
          <span className="travel-page__hint">You can reopen and edit anything later</span>
        </div>

        {finishedTrips.length === 0 ? (
          <div className="travel-page__empty travel-page__empty--soft">
            <p className="travel-page__empty-text">No completed trips yet.</p>
          </div>
        ) : (
          <div className="travel-page__list">
            {finishedTrips.map((trip) => (
              <TravelTripCard
                key={trip.id}
                trip={trip}
                currency={currency}
                onUpdateTrip={onUpdateTrip}
                onSetTripFinished={onSetTripFinished}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
