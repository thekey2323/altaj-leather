import { NextResponse } from 'next/server';
import { 
  getDashboardMetrics, 
  getApplications, 
  getProfile, 
  getConfig, 
  saveConfig, 
  saveProfile, 
  getLogs,
  saveApplications
} from '@/lib/naukri/storage';
import { 
  executeAutoApplyRun, 
  connectNaukriAccountViaBrowser, 
  disconnectNaukriAccount,
  launchEdgeWindow,
  verifyEdgeLoginAndSync
} from '@/lib/naukri/automation';

export async function GET() {
  try {
    const metrics = getDashboardMetrics();
    const applications = getApplications();
    const profile = getProfile();
    const config = getConfig();
    const logs = getLogs();

    return NextResponse.json({
      success: true,
      metrics,
      applications,
      profile,
      config,
      logs
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch Naukrigulf data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'run') {
      const mode = body.mode || 'LIVE';
      const result = await executeAutoApplyRun(mode);
      const metrics = getDashboardMetrics();
      const applications = getApplications();
      const logs = getLogs();

      return NextResponse.json({
        success: true,
        result,
        metrics,
        applications,
        logs
      });
    }

    if (action === 'launch_edge' || action === 'connect_browser') {
      const email = body.email;
      const password = body.password;
      const res = await launchEdgeWindow(email, password);
      const metrics = getDashboardMetrics();
      const config = getConfig();
      const logs = getLogs();
      return NextResponse.json({
        success: res.success,
        message: res.message,
        metrics,
        config,
        logs
      });
    }

    if (action === 'verify_edge') {
      const res = await verifyEdgeLoginAndSync();
      const metrics = getDashboardMetrics();
      const config = getConfig();
      const logs = getLogs();
      return NextResponse.json({
        success: res.success,
        waiting: res.waiting || false,
        message: res.message,
        appliedCount: res.appliedCount,
        candidateName: res.candidateName,
        metrics,
        config,
        logs
      });
    }

    if (action === 'disconnect_account') {
      disconnectNaukriAccount();
      const metrics = getDashboardMetrics();
      const config = getConfig();
      const logs = getLogs();
      return NextResponse.json({
        success: true,
        metrics,
        config,
        logs
      });
    }

    if (action === 'update_config') {
      const current = getConfig();
      const updated = { ...current, ...body.config };
      saveConfig(updated);
      return NextResponse.json({ success: true, config: updated });
    }

    if (action === 'update_profile') {
      const current = getProfile();
      const updated = { ...current, ...body.profile };
      saveProfile(updated);
      return NextResponse.json({ success: true, profile: updated });
    }

    if (action === 'reset_applications' || action === 'clear_all_applications') {
      saveApplications([]);
      const metrics = getDashboardMetrics();
      const logs = getLogs();
      return NextResponse.json({ 
        success: true, 
        message: 'Applications and metrics reset to 0.',
        metrics,
        applications: [],
        logs
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}
