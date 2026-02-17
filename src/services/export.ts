/**
 * Export Service
 * Generate CSV and PDF exports of workout data
 */

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { WorkoutSession, UserStats, BodyMeasurement } from '../types/workout.types';
import { loadWorkoutHistory, loadMeasurements } from './storage';

/**
 * Export workout history and body measurements as CSV
 */
export const exportCSV = async (): Promise<void> => {
  const [workouts, measurements] = await Promise.all([
    loadWorkoutHistory(),
    loadMeasurements(),
  ]);

  let csv = '';

  // Workout History section
  csv += 'WORKOUT HISTORY\n';
  csv += 'Date,Workout Name,Duration (min),Calories,Completion Rate (%),Sets,Reps\n';
  for (const w of workouts) {
    const date = new Date(w.date).toLocaleDateString();
    const mins = Math.floor((w.duration || 0) / 60);
    const name = (w.workoutName || 'Workout').replace(/,/g, ';');
    csv += `${date},${name},${mins},${w.estimatedCalories},${Math.round(w.completionRate || 0)},${w.totalSets},${w.totalReps}\n`;
  }

  csv += '\n';

  // Body Measurements section
  csv += 'BODY MEASUREMENTS\n';
  csv += 'Date,Weight,Body Fat (%),Chest,Waist,Hips,Arms,Thighs,Notes\n';
  for (const m of measurements) {
    const date = new Date(m.date).toLocaleDateString();
    const notes = (m.notes || '').replace(/,/g, ';').replace(/\n/g, ' ');
    csv += `${date},${m.weight ?? ''},${m.bodyFat ?? ''},${m.chest ?? ''},${m.waist ?? ''},${m.hips ?? ''},${m.arms ?? ''},${m.thighs ?? ''},${notes}\n`;
  }

  const filePath = `${FileSystem.cacheDirectory}fitglass_export.csv`;
  await FileSystem.writeAsStringAsync(filePath, csv);
  await Sharing.shareAsync(filePath, {
    mimeType: 'text/csv',
    dialogTitle: 'Export Workout Data',
    UTI: 'public.comma-separated-values-text',
  });
};

/**
 * Export a styled PDF progress report
 */
export const exportPDF = async (userStats: UserStats): Promise<void> => {
  const [workouts, measurements] = await Promise.all([
    loadWorkoutHistory(),
    loadMeasurements(),
  ]);

  const recentWorkouts = workouts.slice(0, 10);
  const recentMeasurements = measurements.slice(0, 5);

  const workoutRows = recentWorkouts
    .map((w) => {
      const date = new Date(w.date).toLocaleDateString();
      const mins = Math.floor((w.duration || 0) / 60);
      return `<tr>
        <td>${date}</td>
        <td>${w.workoutName || 'Workout'}</td>
        <td>${mins} min</td>
        <td>${w.estimatedCalories} cal</td>
        <td>${Math.round(w.completionRate || 0)}%</td>
      </tr>`;
    })
    .join('');

  const measurementRows = recentMeasurements
    .map((m) => {
      const date = new Date(m.date).toLocaleDateString();
      return `<tr>
        <td>${date}</td>
        <td>${m.weight ?? '-'}</td>
        <td>${m.bodyFat != null ? m.bodyFat + '%' : '-'}</td>
        <td>${m.waist ?? '-'}</td>
        <td>${m.chest ?? '-'}</td>
      </tr>`;
    })
    .join('');

  const html = `
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 40px;
          color: #333;
          background: #f8f9fa;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding: 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          color: white;
        }
        .header h1 { margin: 0 0 8px 0; font-size: 28px; }
        .header p { margin: 0; opacity: 0.9; font-size: 14px; }
        .stats-grid {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
        }
        .stat-card {
          flex: 1;
          background: white;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .stat-value { font-size: 32px; font-weight: 700; color: #667eea; }
        .stat-label { font-size: 12px; color: #888; margin-top: 4px; }
        h2 {
          font-size: 20px;
          margin: 32px 0 16px;
          color: #333;
          border-bottom: 2px solid #667eea;
          padding-bottom: 8px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        th {
          background: #667eea;
          color: white;
          padding: 12px;
          text-align: left;
          font-size: 13px;
        }
        td {
          padding: 10px 12px;
          border-bottom: 1px solid #eee;
          font-size: 13px;
        }
        tr:last-child td { border-bottom: none; }
        .footer {
          text-align: center;
          margin-top: 40px;
          font-size: 12px;
          color: #aaa;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>FitGlass Progress Report</h1>
        <p>Generated on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${userStats.totalWorkouts}</div>
          <div class="stat-label">Total Workouts</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${userStats.currentStreak}</div>
          <div class="stat-label">Day Streak</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${userStats.totalMinutes}</div>
          <div class="stat-label">Total Minutes</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${userStats.totalCalories}</div>
          <div class="stat-label">Calories Burned</div>
        </div>
      </div>

      ${recentWorkouts.length > 0 ? `
        <h2>Recent Workouts</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Workout</th>
              <th>Duration</th>
              <th>Calories</th>
              <th>Completion</th>
            </tr>
          </thead>
          <tbody>${workoutRows}</tbody>
        </table>
      ` : ''}

      ${recentMeasurements.length > 0 ? `
        <h2>Body Measurements</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Weight</th>
              <th>Body Fat</th>
              <th>Waist</th>
              <th>Chest</th>
            </tr>
          </thead>
          <tbody>${measurementRows}</tbody>
        </table>
      ` : ''}

      <div class="footer">
        FitGlass Workout App &mdash; Keep pushing forward!
      </div>
    </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Export Progress Report',
    UTI: 'com.adobe.pdf',
  });
};
