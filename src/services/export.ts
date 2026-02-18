/**
 * Export Service
 * Generate CSV and PDF exports of workout data
 */

// Lazy load expo-file-system
let FileSystem: typeof import('expo-file-system') | null = null;
const getFileSystem = async () => {
  if (FileSystem) return FileSystem;
  try {
    FileSystem = await import('expo-file-system');
  } catch (e) {
    console.warn('[ExportService] expo-file-system module not available:', e);
    FileSystem = null;
  }
  return FileSystem;
};
import { WorkoutSession, UserStats, BodyMeasurement } from '../types/workout.types';
import { loadWorkoutHistory, loadMeasurements } from './storage';
import { Alert } from 'react-native';

// Lazy load expo-sharing
let Sharing: typeof import('expo-sharing') | null = null;
const getSharing = async () => {
  if (Sharing) return Sharing;
  try {
    Sharing = await import('expo-sharing');
  } catch (e) {
    console.warn('[ExportService] expo-sharing module not available:', e);
    Sharing = null;
  }
  return Sharing;
};

// Lazy load expo-print
let Print: typeof import('expo-print') | null = null;
const getPrint = async () => {
  if (Print) return Print;
  try {
    Print = await import('expo-print');
  } catch (e) {
    console.warn('[ExportService] expo-print module not available:', e);
    Print = null;
  }
  return Print;
};

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

  const FileSystemModule = await getFileSystem();
  if (!FileSystemModule) {
    Alert.alert('Export Failed', 'File system access is not supported on this device.');
    return;
  }

  const filePath = `${FileSystemModule.cacheDirectory}fitglass_export.csv`;
  await FileSystemModule.writeAsStringAsync(filePath, csv);

  const SharingModule = await getSharing();
  if (SharingModule && (await SharingModule.isAvailableAsync())) {
    await SharingModule.shareAsync(filePath, {
      mimeType: 'text/csv',
      dialogTitle: 'Export Workout Data',
      UTI: 'public.comma-separated-values-text',
    });
  } else {
    Alert.alert('Export Saved', `CSV saved to: ${filePath}`);
  }
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

  try {
    const PrintModule = await getPrint();
    if (PrintModule) {
      const { uri } = await PrintModule.printToFileAsync({ html });
      const SharingModule = await getSharing();
      if (SharingModule && (await SharingModule.isAvailableAsync())) {
        await SharingModule.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Export Progress Report',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Export Saved', `PDF saved to: ${uri}`);
      }
    } else {
      Alert.alert('Export Unavailable', 'Printing service is not supported on this device.');
    }
  } catch (e) {
    console.warn('PDF Export failed:', e);
    Alert.alert('Export Failed', 'Could not start PDF generation.');
  }
};
