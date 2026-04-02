import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
  const token = authHeader.replace('Bearer ', '')
  const {
    data: { user: adminUser },
    error: authError,
  } = await supabase.auth.getUser(token)

  if (authError || !adminUser) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Verify admin role
  const adminRole = adminUser.app_metadata?.role
  if (adminRole !== 'admin') {
    return new Response(JSON.stringify({ error: 'Accès refusé : rôle admin requis' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { target_user_id } = await req.json()
  if (!target_user_id) {
    return new Response(JSON.stringify({ error: 'target_user_id requis' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Prevent self-deletion
  if (target_user_id === adminUser.id) {
    return new Response(JSON.stringify({ error: 'Impossible de supprimer votre propre compte' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Log action BEFORE deletion (irréversible)
  const { error: logError } = await supabase.from('admin_log').insert({
    admin_id: adminUser.id,
    action: 'delete_user',
    target_id: target_user_id,
    old_value: 'account_existed',
    new_value: 'account_deleted_rgpd',
  })

  if (logError) {
    return new Response(JSON.stringify({ error: 'Échec de journalisation', details: logError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Delete user (cascades to user_usage, user_profiles, profile_plans, mobile_transit)
  const { error: deleteError } = await supabase.auth.admin.deleteUser(target_user_id)

  if (deleteError) {
    return new Response(JSON.stringify({ error: 'Échec de suppression', details: deleteError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ success: true, message: 'Compte supprimé définitivement' }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
})
