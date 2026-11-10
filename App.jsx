import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen, GraduationCap, LayoutDashboard, ClipboardList, Users, Settings,
  LogOut, Search, Plus, Clock3, CheckCircle2, Menu, X, ArrowUpRight,
  FileText, Sparkles, ChevronRight, ShieldCheck, CircleUserRound, Send, Award
} from 'lucide-react';
import { api, API_BASE } from './api.js';

const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0,2).map(x => x[0]).join('').toUpperCase();
const dateLabel = (date) => date ? new Date(date).toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' }) : 'No deadline';

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
  name: '',
  email: '',
  password: '',
  role: 'student'
});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const result = await api(`/auth/${mode}`, { method:'POST', body:JSON.stringify(form) });
      localStorage.setItem('lms_token', result.token);
      onAuth(result.user);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <div className="auth-shell">
    <div className="auth-art">
      <div className="brand brand-light"><span className="brand-icon"><GraduationCap size={23}/></span> LearnSpace</div>
      <div className="art-copy"><span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h1>Learning that<br/>moves you forward.</h1><p>One place for courses, assignments, progress and everything you need to grow.</p></div>
      <div className="art-stats"><div><strong>Learn</strong><span>at your pace</span></div><div><strong>Grow</strong><span>every day</span></div><div><strong>Achieve</strong><span>your goals</span></div></div>
      <div className="orb orb-one"></div><div className="orb orb-two"></div>
    </div>
    <div className="auth-panel"><div className="auth-card">
      <div className="mobile-brand brand"><span className="brand-icon"><GraduationCap size={23}/></span> LearnSpace</div>
      <span className="eyebrow muted">{mode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}</span>
      <h2>{mode === 'login' ? 'Sign in to your account' : 'Create your account'}</h2>
      <p className="muted">{mode === 'login' ? 'Pick up where you left off.' : 'Join your learning community today.'}</p>
      <form onSubmit={submit} className="auth-form">
        {mode === 'register' && <label>Full name<input name="name" value={form.name} onChange={change} placeholder="Your name" required minLength="2"/></label>}
        
{mode === 'register' && (
  <label>
    Register as
    <select
      name="role"
      value={form.role}
      onChange={change}
      required
    >
      <option value="student">Student</option>
      <option value="teacher">Teacher</option>
    </select>
  </label>
)}

        <label>Email address<input name="email" type="email" value={form.email} onChange={change} placeholder="you@example.com" required/></label>
        <label>Password<input name="password" type="password" value={form.password} onChange={change} placeholder="At least 8 characters" required minLength="8"/></label>
        {error && <div className="error-box">{error}</div>}
        <button className="btn btn-primary full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowUpRight size={17}/></button>
      </form>
      <p className="switch-auth">{mode === 'login' ? "Don't have an account?" : 'Already have an account?'} <button onClick={() => {setMode(mode === 'login' ? 'register' : 'login');setError('')}}>{mode === 'login' ? 'Create one' : 'Sign in'}</button></p>
      <div className="auth-note"><ShieldCheck size={15}/> Secure sign-in · Your data stays private</div>
    </div></div>
  </div>;
}

function ProfilePage({ user, onUserUpdated }) {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function saveProfile(e) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    setError('');

    try {
      const result = await api('/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name, email })
      });

      onUserUpdated(result.user);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      setBusy(false);
      return;
    }

    try {
      const result = await api('/profile/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      setMessage(result.message || 'Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="profile-page">
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Personal information</h2>
            <p>Update your account details.</p>
          </div>
          <div className="avatar">{initials(name || user.name)}</div>
        </div>

        <form className="auth-form" onSubmit={saveProfile}>
          <label>
            Full name
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              minLength={2}
              maxLength={120}
              required
            />
          </label>

          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Account role
            <input value={user.role} readOnly />
          </label>

          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Change password</h2>
            <p>Verify your current password before changing it.</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={changePassword}>
          <label>
            Current password
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <label>
            New password
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              minLength={8}
              autoComplete="new-password"
              required
            />
          </label>

          <label>
            Confirm new password
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              minLength={8}
              autoComplete="new-password"
              required
            />
          </label>

          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Please wait...' : 'Change password'}
          </button>
        </form>
      </section>

      {message && <div className="success-banner">{message}</div>}
      {error && <div className="error-banner">{error}</div>}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState('Overview');
  const [courses, setCourses] = useState([]);
  const [mine, setMine] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [modal, setModal] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [mobileNav, setMobileNav] = useState(false);

  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';
  const navItems = useMemo(() => [
    { title:'Workspace', items:[
      { name:'Overview', icon:LayoutDashboard },
      { name:isStudent ? 'Explore courses' : 'Courses', icon:BookOpen },
      { name:'Assignments', icon:ClipboardList },
      { name:'Learning tools', icon:Sparkles },
    ]},
    
{ title:'Manage', items:[
  { name:'Profile', icon:Users },
  ...(isAdmin ? [{name:'Users',icon:Users}] : []),
  ...(!isStudent ? [{name:'Submissions',icon:FileText}] : []),
]}

  ], [isStudent,isAdmin]);

  async function loadData() {
    setError('');
    try {
      const [courseData, mineData, assignmentData, dashData] = await Promise.all([
        api('/courses'), api('/enrollments/mine'), api('/assignments'), api('/dashboard')
      ]);
      setCourses(courseData.courses || []); setMine(mineData.courses || []);
      setAssignments(assignmentData.assignments || []); setStats(dashData.stats || {});
      if (user?.role === 'admin') { const u = await api('/users'); setUsers(u.users || []); }
    } catch (err) { setError(err.message); }
  }

  useEffect(() => {
    const token = localStorage.getItem('lms_token');
    if (!token) { setLoading(false); return; }
    api('/auth/me').then(({user}) => setUser(user)).catch(() => localStorage.removeItem('lms_token')).finally(() => setLoading(false));
  }, []);
  useEffect(() => { if (user) loadData(); }, [user]);
  useEffect(() => { if (notice) { const id = setTimeout(() => setNotice(''), 3500); return () => clearTimeout(id); } }, [notice]);

  
function logout() {
  localStorage.removeItem('lms_token');
  setUser(null);
  setPage('Overview');
  setError('');
  setNotice('');
  setModal('');
  setMobileNav(false);
}

  async function runAction(fn, success) {
    try { await fn(); await loadData(); setNotice(success); setError(''); setModal(''); }
    catch (err) { setError(err.message); }
  }
  const filteredCourses = courses.filter(c => `${c.title} ${c.category} ${c.teacher_name || ''}`.toLowerCase().includes(query.toLowerCase()));
  const pageTitle = page === 'Overview' ? `Good to see you, ${user?.name?.split(' ')[0] || 'there'}.` : page;
  const pageSubtitle = page === 'Overview' ? 'Here’s what’s happening with your learning today.' : 'Manage your learning space and keep moving forward.';

  if (loading) return <div className="loading-screen"><div className="loader"></div><span>Preparing your learning space…</span></div>;
  if (!user) return <AuthScreen onAuth={setUser}/>;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-icon"><GraduationCap size={23}/></span> LearnSpace</div>
      <div className="workspace-chip"><span className="workspace-dot"></span><span><b>My workspace</b><small>{user.role[0].toUpperCase()+user.role.slice(1)} account</small></span><ChevronRight size={16}/></div>
      <nav>{navItems.map(group => <div className="nav-group" key={group.title}><span className="nav-label">{group.title}</span>{group.items.map(item => <button key={item.name} className={`nav-link ${page===item.name?'active':''}`} onClick={() => {setPage(item.name);setMobileNav(false)}}><item.icon size={18}/><span>{item.name}</span>{page===item.name && <span className="active-bar"/>}</button>)}</div>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><Sparkles size={17}/></div><b>Keep your momentum</b><p>Small steps add up to big progress.</p></div><div className="profile-row"><div className="avatar">{initials(user.name)}</div><button className="icon-btn" title="Sign out" onClick={logout}>
  <LogOut size={17} />
</button><div className="profile-info"><b>{user.name}</b><span>{user.email}</span></div>
<button
  type="button"
  onClick={logout}
  title="Sign out"
  aria-label="Sign out"
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: "36px",
    height: "36px",
    border: "1px solid #e5e7eb",
    borderRadius: "9px",
    backgroundColor: "#ffffff",
    color: "#ef4444",
    cursor: "pointer",
    fontSize: "20px",
    fontWeight: "bold",
    lineHeight: 1
  }}
>
  ↪
</button>
</div></div>
    </aside>
    {mobileNav && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMobileNav(false)}><X/></button>}
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu icon-btn" onClick={() => setMobileNav(true)}><Menu/></button><div className="breadcrumbs"><span>LearnSpace</span><ChevronRight size={14}/><b>{page}</b></div><div className="topbar-right"><span className="online-pill"><span></span> Workspace active</span><div className="avatar avatar-small">{initials(user.name)}</div></div></header>
      <div className="page-content">
        <div className="page-heading"><div><span className="eyebrow muted">{new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</span><h1>{pageTitle}</h1><p>{pageSubtitle}</p></div>{!isStudent && <button className="btn btn-primary" onClick={() => setModal(page === 'Assignments' ? 'assignment' : 'course')}><Plus size={17}/>{page === 'Assignments' ? 'New assignment' : 'Create course'}</button>}</div>
        {error && <div className="error-banner"><span>{error}</span><button onClick={() => setError('')}>Dismiss</button></div>}
        {notice && <div className="success-banner"><CheckCircle2 size={17}/>{notice}</div>}
        {page === 'Overview' && <Overview user={user} stats={stats} courses={mine} assignments={assignments} setPage={setPage} setSelectedAssignment={setSelectedAssignment} setModal={setModal}/>}
        {page === 'Profile' && (
  <ProfilePage
    user={user}
    onUserUpdated={updatedUser => setUser(updatedUser)}
  />
)}
        {(page === 'Courses' || page === 'Explore courses') && <Courses user={user} courses={filteredCourses} mine={mine} query={query} setQuery={setQuery} setPage={setPage} onEnroll={id => runAction(() => api(`/courses/${id}/enroll`,{method:'POST'}),'You enrolled in the course.')} onDelete={id => {if(confirm('Delete this course and its related records?')) runAction(() => api(`/courses/${id}`,{method:'DELETE'}),'Course deleted.')}} />}
        {page === 'Assignments' && <Assignments user={user} assignments={assignments} setModal={setModal} setSelectedAssignment={setSelectedAssignment} onSubmit={async (id, answer) => runAction(() => api(`/assignments/${id}/submit`, {method:'POST', body:JSON.stringify({answer_text:answer})}), 'Assignment submitted successfully.')}/>}
        {page === 'Learning tools' && <LearningTools user={user} courses={mine} allCourses={courses} onNotice={setNotice} onError={setError}/>} 
        {page === 'Users' && isAdmin && <UsersPage users={users} onRole={(id,role) => runAction(() => api(`/users/${id}/role`,{method:'PATCH',body:JSON.stringify({role})}),'User role updated.')}/>}
        {page === 'Submissions' && !isStudent && <SubmissionPage assignments={assignments} onOpen={async a => {try {const d=await api(`/assignments/${a.id}/submissions`);setSubmissions(d.submissions||[]);setSelectedAssignment(a);setModal('submissions')}catch(err){setError(err.message)}}}/>}
      </div>
    </main>
    {modal === 'course' && <CourseModal onClose={() => setModal('')} onSave={data => runAction(() => api('/courses',{method:'POST',body:JSON.stringify(data)}),'Course created successfully.')}/>}
    {modal === 'assignment' && <AssignmentModal courses={mine} onClose={() => setModal('')} onSave={data => runAction(() => api('/assignments',{method:'POST',body:JSON.stringify(data)}),'Assignment created successfully.')}/>}
    {modal === 'submit' && selectedAssignment && <SubmitModal assignment={selectedAssignment} onClose={() => setModal('')} onSave={async ({answer,file}) => {
  const formData = new FormData();
  formData.append('answer_text', answer);
  if (file) formData.append('file', file);

  return runAction(
    () => api(`/assignments/${selectedAssignment.id}/submit`, {
      method: 'POST',
      body: formData
    }),
    'Assignment submitted successfully.'
  );
}}/>}

    {modal === 'submissions' && selectedAssignment && <SubmissionsModal assignment={selectedAssignment} submissions={submissions} onClose={() => setModal('')} onGrade={(id,score,feedback) => runAction(() => api(`/submissions/${id}/grade`,{method:'PATCH',body:JSON.stringify({score:Number(score),feedback})}), 'Grade saved.')}/>}
  </div>;
}


function LearningTools({user,courses,allCourses,onNotice,onError}) {
  const student=user.role==='student';
  const [courseId,setCourseId]=useState(String(courses[0]?.id||''));
  const [materials,setMaterials]=useState([]);
const [quizzes,setQuizzes]=useState([]);
const [quizResults,setQuizResults]=useState([]);
const [selectedResultsQuiz,setSelectedResultsQuiz]=useState(null);
const [attendance,setAttendance]=useState([]);
const [notifications,setNotifications]=useState([]);
const [certificates,setCertificates]=useState([]);
  const [quizModal,setQuizModal]=useState(null);const [quizAnswers,setQuizAnswers]=useState({});const [quizTitle,setQuizTitle]=useState('');const [quizDescription,setQuizDescription]=useState('');const [questionText,setQuestionText]=useState('');
  const [sessionTitle,setSessionTitle]=useState('');const [sessionDate,setSessionDate]=useState(new Date().toISOString().slice(0,10));const [sessionId,setSessionId]=useState('');const [roster,setRoster]=useState([]);
  const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
  const selectedCourse=courses.find(c=>String(c.id)===String(courseId));
  async function refresh(){if(!courseId)return;try{const [m,q,a,n,c]=await Promise.all([api(`/courses/${courseId}/materials`),api(`/courses/${courseId}/quizzes`),api(`/courses/${courseId}/attendance`),api('/notifications'),api('/certificates/mine')]);setMaterials(m.materials||[]);setQuizzes(q.quizzes||[]);setAttendance(a.attendance||[]);setNotifications(n.notifications||[]);setCertificates(c.certificates||[]);}catch(e){onError(e.message)}}
  useEffect(()=>{if(courses.length&&!courses.some(c=>String(c.id)===String(courseId)))setCourseId(String(courses[0].id));},[courses]);
  useEffect(()=>{refresh();},[courseId]);
  const inform=(text)=>{setMessage(text);onNotice(text);};
  async function uploadFile(e){const file=e.target.files?.[0];if(!file||!courseId)return;const body=new FormData();body.append('file',file);setBusy(true);try{const token=localStorage.getItem('lms_token');const response=await fetch(`${API_BASE}/courses/${courseId}/materials`,{method:'POST',headers:{Authorization:`Bearer ${token}`},body});const data=await response.json();if(!response.ok)throw new Error(data.error||'Upload failed');inform('Learning material uploaded.');await refresh();}catch(err){onError(err.message)}finally{setBusy(false);e.target.value=''}}
  async function createQuiz(e){e.preventDefault();try{const questions=questionText.split('\n').map(x=>x.trim()).filter(Boolean).map(line=>{const [prompt,opts,answer]=line.split('|');return {prompt,options:(opts||'').split(';').map(x=>x.trim()).filter(Boolean),correct_option:Number(answer),points:1}});await api(`/courses/${courseId}/quizzes`,{method:'POST',body:JSON.stringify({title:quizTitle,description:quizDescription,questions})});setQuizTitle('');setQuizDescription('');setQuestionText('');inform('Quiz created.');await refresh();}catch(e){onError(e.message)}}
  async function openQuiz(q){try{const data=await api(`/quizzes/${q.id}`);setQuizAnswers({});setQuizModal(data.quiz)}catch(e){onError(e.message)}}
  async function viewQuizResults(q) {
  try {
    const data = await api(`/quizzes/${q.id}/attempts`);
    setQuizResults(data.attempts || []);
    setSelectedResultsQuiz(q);
  } catch (e) {
    onError(e.message);
  }
}
  async function submitQuiz(){if(!quizModal)return;try{const r=await api(`/quizzes/${quizModal.id}/attempts`,{method:'POST',body:JSON.stringify({answers:quizAnswers})});inform(`Quiz scored ${r.attempt.score} / ${r.attempt.max_score}.`);setQuizModal(null);await refresh()}catch(e){onError(e.message)}}
  async function createSession(e){e.preventDefault();try{const d=await api(`/courses/${courseId}/attendance-sessions`,{method:'POST',body:JSON.stringify({title:sessionTitle,session_date:sessionDate})});setSessionId(String(d.session.id));setSessionTitle('');inform('Attendance session created.');await loadRoster(d.session.id);await refresh()}catch(e){onError(e.message)}}
  async function loadRoster(id){try{const d=await api(`/attendance-sessions/${id}/roster`);setRoster(d.roster||[]);setSessionId(String(id))}catch(e){onError(e.message)}}
  async function saveAttendance(){try{const records=roster.map(r=>({student_id:r.student_id,status:r.status}));const d=await api(`/attendance-sessions/${sessionId}/records`,{method:'PUT',body:JSON.stringify({records})});inform(d.message);await refresh()}catch(e){onError(e.message)}}
  async function requestCertificate(){try{const d=await api(`/courses/${courseId}/certificate`,{method:'POST',body:JSON.stringify({})});inform(`Certificate issued: ${d.certificate.certificate_code}`);await refresh()}catch(e){onError(e.message)}}
  async function buyCourse(course){try{if(!window.Razorpay){await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://checkout.razorpay.com/v1/checkout.js';script.onload=resolve;script.onerror=reject;document.body.appendChild(script)})}const order=await api('/payments/orders',{method:'POST',body:JSON.stringify({course_id:course.id})});const checkout=new window.Razorpay({key:order.key_id,amount:order.amount,currency:order.currency,name:'LearnSpace',description:order.course_title,order_id:order.order_id,prefill:{name:user.name,email:user.email},handler:async response=>{try{await api('/payments/verify',{method:'POST',body:JSON.stringify(response)});inform('Payment verified. You are enrolled!')}catch(e){onError(e.message)}}});checkout.open()}catch(e){onError(e.message)}}
  async function markRead(id){try{await api(`/notifications/${id}/read`,{method:'PATCH'});await refresh()}catch(e){onError(e.message)}}
  async function downloadMaterial(m){try{const token=localStorage.getItem('lms_token');const res=await fetch(`${API_BASE}/materials/${m.id}/download`,{headers:{Authorization:`Bearer ${token}`}});if(!res.ok){const d=await res.json();throw new Error(d.error||'Download failed')}const blob=await res.blob();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=m.original_name;a.click();URL.revokeObjectURL(url)}catch(e){onError(e.message)}}
  if(!courses.length)return <div className="panel"><Empty icon={BookOpen} title="Choose a course first" text={student?'Enroll in a course to access learning tools.':'Create a course before adding learning materials, quizzes or attendance.'}/></div>;
  return <div className="tools-page">
    <div className="panel tools-course-picker"><div><h3>Course workspace</h3><p>Choose a course to manage its learning activities.</p></div><select value={courseId} onChange={e=>setCourseId(e.target.value)}>{courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
    <div className="tools-grid">
      <section className="panel"><div className="panel-heading"><div><h3><FileText size={17}/> Learning materials</h3><p>PDFs, images, Office files, ZIP and MP4 up to 20 MB.</p></div></div>
        {!student&&<label className="upload-drop"><input type="file" onChange={uploadFile} disabled={busy}/><span><Plus size={18}/>{busy?'Uploading…':'Choose a file to upload'}</span><small>Files are private to enrolled learners and course staff.</small></label>}
        <div className="tool-list">{materials.length?materials.map(m=><div className="tool-row" key={m.id}><FileText size={18}/><div><b>{m.original_name}</b><small>{Math.max(1,Math.round(Number(m.size_bytes)/1024))} KB · {dateLabel(m.created_at)}</small></div><button className="text-button" onClick={()=>downloadMaterial(m)}>Download</button></div>):<p className="tool-empty">No materials have been uploaded.</p>}</div>
      </section>
      <section className="panel"><div className="panel-heading"><div><h3><ClipboardList size={17}/> Quizzes</h3><p>Multiple-choice quizzes with automatic scoring.</p></div></div>
        {!student&&<form className="tool-form" onSubmit={createQuiz}><input required minLength="3" value={quizTitle} onChange={e=>setQuizTitle(e.target.value)} placeholder="Quiz title"/><textarea required rows="3" value={questionText} onChange={e=>setQuestionText(e.target.value)} placeholder={'One question per line: Prompt | option A;option B;option C | correct option index (0-based)\nExample: 2+2? | 3;4;5 | 1'}/><button className="btn btn-primary btn-small">Create quiz <Plus size={14}/></button></form>}
        <div className="tool-list">{quizzes.length?quizzes.map(q=><div className="tool-row" key={q.id}><ClipboardList size={18}/><div><b>{q.title}</b><small>{q.question_count} questions {q.last_score!==null&&q.last_score!==undefined?`· Last score ${q.last_score}/${q.last_max_score}`:''}</small></div>{student ? (
  <button className="text-button" onClick={() => openQuiz(q)}>
    Start <ArrowUpRight size={13}/>
  </button>
) : (
  <button className="text-button" onClick={() => viewQuizResults(q)}>
    View results <ArrowUpRight size={13}/>
  </button>
)}</div>):<p className="tool-empty">No quizzes for this course yet.</p>}</div>
      </section>
      <section className="panel"><div className="panel-heading"><div><h3><Users size={17}/> Attendance</h3><p>Track attendance by class session.</p></div></div>
        {!student&&<form className="tool-form tool-inline" onSubmit={createSession}><input required value={sessionTitle} onChange={e=>setSessionTitle(e.target.value)} placeholder="Session name"/><input type="date" value={sessionDate} onChange={e=>setSessionDate(e.target.value)}/><button className="btn btn-primary btn-small">Create session</button></form>}
        <div className="tool-list">{attendance.length?attendance.map((a,i)=><div className="tool-row" key={`${a.session_id}-${a.student_id||i}`}><Clock3 size={18}/><div><b>{a.title}</b><small>{dateLabel(a.session_date)} {a.student_name?`· ${a.student_name}`:''}</small></div><span className={`attendance-pill ${a.status||'unmarked'}`}>{a.status||'Unmarked'}</span>{!student&&<button className="text-button" onClick={()=>loadRoster(a.session_id)}>Mark</button>}</div>):<p className="tool-empty">No attendance sessions have been recorded.</p>}</div>
        {!student&&sessionId&&<div className="roster-editor"><b>Mark attendance for selected session</b>{roster.length?roster.map(r=><div className="roster-row" key={r.student_id}><span>{r.name}</span><select value={r.status} onChange={e=>setRoster(old=>old.map(x=>x.student_id===r.student_id?{...x,status:e.target.value}:x))}><option value="present">Present</option><option value="absent">Absent</option><option value="late">Late</option></select></div>):<p className="tool-empty">Enroll students in this course before marking attendance.</p>}{!!roster.length&&<button className="btn btn-primary btn-small" onClick={saveAttendance}>Save attendance</button>}</div>}
      </section>
      <section className="panel"><div className="panel-heading"><div><h3><Award size={17}/> Certificates</h3><p>Issue and download course completion certificates.</p></div></div>
        {student&&<button className="btn btn-primary btn-small" onClick={requestCertificate}>Check completion & request certificate</button>}
        <div className="tool-list">{certificates.filter(c=>String(c.course_id)===String(courseId)).length?certificates.filter(c=>String(c.course_id)===String(courseId)).map(c=><div className="tool-row" key={c.id}><Award size={18}/><div><b>{c.course_title}</b><small>{c.certificate_code} · {dateLabel(c.issued_at)}</small></div><button className="text-button" onClick={async()=>{try{const token=localStorage.getItem('lms_token');const res=await fetch(`${API_BASE}/certificates/${c.id}/pdf`,{headers:{Authorization:`Bearer ${token}`}});if(!res.ok)throw new Error('Could not download certificate');const blob=await res.blob();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${c.certificate_code}.pdf`;a.click();URL.revokeObjectURL(url)}catch(e){onError(e.message)}}}>PDF <ArrowUpRight size={13}/></button></div>):<p className="tool-empty">No certificate issued for this course yet.</p>}</div>
        {!student&&<p className="feature-note">Certificates are requested by students after every assignment in the course is submitted and graded.</p>}
      </section>
      <section className="panel"><div className="panel-heading"><div><h3><Sparkles size={17}/> Notifications</h3><p>Course updates and activity messages.</p></div><button className="text-button" onClick={async()=>{try{await api('/notifications/read-all',{method:'POST'});await refresh()}catch(e){onError(e.message)}}}>Mark all read</button></div>
        <div className="tool-list">{notifications.length?notifications.slice(0,8).map(n=><div className={`tool-row notification-row ${n.read_at?'read':''}`} key={n.id}><span className="notification-dot"></span><div><b>{n.title}</b><small>{n.message} · {dateLabel(n.created_at)}</small></div>{!n.read_at&&<button className="text-button" onClick={()=>markRead(n.id)}>Read</button>}</div>):<p className="tool-empty">You're all caught up.</p>}</div>
      </section>
      {student&&<section className="panel"><div className="panel-heading"><div><h3><ShieldCheck size={17}/> Paid courses</h3><p>Payments are processed by Razorpay when keys are configured.</p></div></div><div className="tool-list">{allCourses.filter(c=>Number(c.price_paise)>0&&!courses.some(m=>Number(m.id)===Number(c.id))).map(c=><div className="tool-row" key={c.id}><BookOpen size={18}/><div><b>{c.title}</b><small>₹{(Number(c.price_paise)/100).toFixed(2)}</small></div><button className="btn btn-primary btn-small" onClick={()=>buyCourse(c)}>Buy course</button></div>)}{!allCourses.some(c=>Number(c.price_paise)>0&&!courses.some(m=>Number(m.id)===Number(c.id)))&&<p className="tool-empty">No paid courses are available to purchase.</p>}</div></section>}
    </div>
    {quizModal&&<div className="modal-backdrop"><div className="modal"><div className="modal-header"><div><h2>{quizModal.title}</h2><p>{quizModal.description||'Choose one answer for each question.'}</p></div><button className="icon-btn" onClick={()=>setQuizModal(null)}><X/></button></div><div className="quiz-question-list">{quizModal.questions.map((q,i)=><div className="quiz-question" key={q.id}><b>{i+1}. {q.prompt}</b>{q.options.map((opt,j)=><label key={j} className="quiz-option"><input type="radio" name={`q-${q.id}`} checked={String(quizAnswers[q.id])===String(j)} onChange={()=>setQuizAnswers(old=>({...old,[q.id]:j}))}/>{opt}</label>)}</div>)}</div><div className="modal-actions"><button className="btn btn-outline" onClick={()=>setQuizModal(null)}>Cancel</button><button className="btn btn-primary" onClick={submitQuiz}>Submit quiz <Send size={15}/></button></div></div></div>}
  
    {selectedResultsQuiz && (
      <ModalShell
        title="Quiz results"
        subtitle={selectedResultsQuiz.title}
        onClose={() => {
          setSelectedResultsQuiz(null);
          setQuizResults([]);
        }}
      >
        {quizResults.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Score</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {quizResults.map(result => (
                  <tr key={result.id}>
                    <td>{result.student_name}</td>
                    <td>{result.email}</td>
                    <td>{result.score} / {result.max_score}</td>
                    <td>{dateLabel(result.submitted_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            icon={ClipboardList}
            title="No quiz submissions yet"
            text="Student results will appear here after students submit this quiz."
          />
        )}
      </ModalShell>
    )}
</div>;
}


function Overview({user,stats,courses,assignments,setPage,setSelectedAssignment,setModal}) {
  const student = user.role === 'student';

  const submittedCount = assignments.filter(a => a.submission_id).length;
  const totalAssignments = assignments.length;
  const overallProgress = totalAssignments
    ? Math.round((submittedCount / totalAssignments) * 100)
    : 0;

  const cards = student
    ? [
        {label:'My courses',value:stats.courses||0,icon:BookOpen,color:'violet',foot:'Courses you’re enrolled in'},
        {label:'Assignments',value:stats.assignments||0,icon:ClipboardList,color:'blue',foot:'Available to work on'},
        {label:'Submissions',value:stats.submissions||0,icon:CheckCircle2,color:'green',foot:'Work you have submitted'}
      ]
    : [
        {label:'Courses',value:stats.courses||0,icon:BookOpen,color:'violet',foot:'Courses in your workspace'},
        {label:'Students',value:stats.students||0,icon:Users,color:'blue',foot:'Learners connected to courses'},
        {label:'Assignments',value:stats.assignments||0,icon:ClipboardList,color:'green',foot:'Activities created'}
      ];

  return <>
    <section className="welcome-banner">
      <div className="welcome-content">
        <span className="welcome-label"><Sparkles size={14}/> YOUR LEARNING SPACE</span>
        <h2>{student ? 'Make today a learning day.' : 'Create opportunities to grow.'}</h2>
        <p>{student ? 'Pick a course, explore a new idea, and keep your progress going.' : 'Bring your courses, learners and assignments together in one place.'}</p>
        <button className="btn btn-white" onClick={() => setPage(student?'Explore courses':'Courses')}>
          {student?'Explore courses':'View courses'} <ArrowUpRight size={16}/>
        </button>
      </div>
      <div className="welcome-graphic">
        <div className="graphic-circle"><GraduationCap size={70}/></div>
        <span className="float-tag tag-one"><CheckCircle2 size={15}/> Keep growing</span>
        <span className="float-tag tag-two"><Sparkles size={15}/> Learn something new</span>
      </div>
    </section>

    <section className="stats-grid">
      {cards.map(c => (
        <div className="stat-card" key={c.label}>
          <div className={`stat-icon ${c.color}`}><c.icon size={20}/></div>
          <span className="stat-label">{c.label}</span>
          <strong className="stat-value">{c.value}</strong>
          <span className="stat-foot">{c.foot}</span>
        </div>
      ))}
    </section>

    {student && (
      <section className="panel" style={{marginBottom:24}}>
        <div className="panel-heading">
          <div>
            <h3>My learning progress</h3>
            <p>Track your assignment completion across your learning activities.</p>
          </div>
          <span style={{fontSize:24,fontWeight:700,color:'#6c5ce7'}}>
            {overallProgress}%
          </span>
        </div>

        <div style={{height:10,background:'#eeecf7',borderRadius:10,overflow:'hidden',marginBottom:20}}>
          <div style={{
            width:`${overallProgress}%`,
            height:'100%',
            background:'linear-gradient(90deg,#7967f5,#45c6a5)',
            borderRadius:10,
            transition:'width 0.4s ease'
          }}/>
        </div>

        <p style={{color:'#73788c',fontSize:13,marginBottom:20}}>
          {submittedCount} of {totalAssignments} assignments submitted
        </p>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16}}>
          {courses.map(course => {
            const courseAssignments = assignments.filter(a =>
              Number(a.course_id) === Number(course.id) ||
              (!a.course_id && a.course_title === course.title)
            );

            const completed = courseAssignments.filter(a => a.submission_id).length;
            const total = courseAssignments.length;
            const progress = total ? Math.round((completed / total) * 100) : 0;

            return (
              <div key={course.id} style={{
                border:'1px solid #e9e7f2',
                borderRadius:12,
                padding:16
              }}>
                <div style={{display:'flex',justifyContent:'space-between',gap:10,marginBottom:12}}>
                  <strong>{course.title}</strong>
                  <span style={{color:'#6c5ce7',fontWeight:600}}>{progress}%</span>
                </div>
                <div style={{height:7,background:'#eeecf7',borderRadius:8,overflow:'hidden'}}>
                  <div style={{
                    width:`${progress}%`,
                    height:'100%',
                    background:'#7967f5',
                    borderRadius:8
                  }}/>
                </div>
                <p style={{fontSize:12,color:'#73788c',marginTop:10}}>
                  {total ? `${completed} of ${total} assignments submitted` : 'No assignments available yet'}
                </p>
              </div>
            );
          })}
        </div>

        {!courses.length && (
          <p style={{color:'#73788c'}}>Enroll in a course to start tracking your learning.</p>
        )}
      </section>
    )}

    <div className="section-grid">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>{student?'My learning':'Your courses'}</h3>
            <p>{student?'Pick up where you left off.':'Manage the courses in your workspace.'}</p>
          </div>
          <button className="text-button" onClick={() => setPage(student?'Explore courses':'Courses')}>
            View all <ChevronRight size={15}/>
          </button>
        </div>

        {courses.length ? (
          <div className="mini-course-list">
            {courses.slice(0,3).map((c,i)=>(
              <div className="mini-course" key={c.id}>
                <div className={`course-mark mark-${i%4}`}><BookOpen size={20}/></div>
                <div className="mini-course-copy">
                  <b>{c.title}</b>
                  <span>{c.teacher_name || c.category || 'Course'}</span>
                </div>
                <span className="course-category">{c.category}</span>
              </div>
            ))}
          </div>
        ) : (
          <Empty icon={BookOpen} title={student?'Your courses will show up here':'No courses yet'} text={student?'Explore courses to start learning.':'Create your first course to get started.'}/>
        )}
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>Upcoming assignments</h3>
            <p>Keep an eye on what’s due next.</p>
          </div>
          <button className="text-button" onClick={() => setPage('Assignments')}>
            View all <ChevronRight size={15}/>
          </button>
        </div>

        {assignments.length ? (
          <div className="assignment-list">
            {assignments.slice(0,4).map(a=>(
              <div className="assignment-row" key={a.id}>
                <div className="assignment-mark"><FileText size={18}/></div>
                <div className="assignment-copy">
                  <b>{a.title}</b>
                  <span>{a.course_title}</span>
                </div>
                <span className="due-date"><Clock3 size={13}/>{dateLabel(a.due_date)}</span>
              </div>
            ))}
          </div>
        ) : (
          <Empty icon={ClipboardList} title="Nothing due just yet" text="New assignments will appear here."/>
        )}
      </section>
    </div>
  </>;
}


function Courses({user,courses,mine,query,setQuery,setPage,onEnroll,onDelete}) {
  const student = user.role === 'student';
  const enrolled = new Set(mine.map(c=>Number(c.id)));
  return <><div className="toolbar"><div className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search courses, topics, teachers…"/></div><span className="result-count">{courses.length} course{courses.length===1?'':'s'}</span></div>
    {courses.length ? <div className="course-grid">{courses.map((c,i)=><article className="course-card" key={c.id}><div className={`course-cover cover-${i%4}`}><div className="cover-orbit"></div><div className="cover-icon"><BookOpen size={29}/></div><span className="cover-category">{c.category}</span></div><div className="course-card-body"><div className="course-meta"><span><GraduationCap size={14}/>{c.teacher_name||'Course instructor'}</span><span>{c.student_count??'—'} learners</span></div><h3>{c.title}</h3><p>{c.description||'Build your skills with guided learning and practical activities.'}</p><div className="course-card-bottom">{student ? enrolled.has(Number(c.id)) ? <span className="enrolled-tag"><CheckCircle2 size={15}/> Enrolled</span> : Number(c.price_paise)>0 ? <button className="btn btn-primary btn-small" onClick={()=>setPage('Learning tools')}>Buy course <ArrowUpRight size={15}/></button> : <button className="btn btn-primary btn-small" onClick={()=>onEnroll(c.id)}>Enroll now <ArrowUpRight size={15}/></button> : <span className="category-note"><BookOpen size={14}/> Course workspace</span>}{!student && (user.role==='admin'||Number(c.teacher_id)===Number(user.id)) && <button className="icon-btn danger-icon" title="Delete course" onClick={()=>onDelete(c.id)}><X size={17}/></button>}</div></div></article>)}</div> : <Empty icon={BookOpen} title="No courses found" text={query?'Try another search term.':'Create or publish a course to see it here.'}/>}</>;
}


function Assignments({user,assignments,setSelectedAssignment,setModal,onSubmit}) {
  const student = user.role === 'student';

  return (
    <div className="panel assignment-panel">
      <div className="panel-heading">
        <div>
          <h3>All assignments</h3>
          <p>{student ? 'Submit your work before the deadline.' : 'Review assignment activity across your courses.'}</p>
        </div>
        <span className="result-count">{assignments.length} total</span>
      </div>

      {assignments.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Assignment</th>
                <th>Course</th>
                <th>Due date</th>
                <th>Status / Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(a => {
                const graded = a.submission_id != null &&
                  a.score !== null && a.score !== undefined;

                return (
                  <tr key={a.id}>
                    <td>
                      <div className="table-title">
                        <span className="table-icon">
                          <FileText size={17}/>
                        </span>
                        <span>
                          <b>{a.title}</b>
                          <small>{a.max_score} points possible</small>
                        </span>
                      </div>
                    </td>

                    <td>{a.course_title}</td>
                    <td>{dateLabel(a.due_date)}</td>

                    <td>
                      {student ? (
                        !a.submission_id ? (
                          <span className="status status-pending">
                            Not submitted
                          </span>
                        ) : graded ? (
                          <div>
                            <span className="status status-done">
                              <CheckCircle2 size={13}/> Graded
                            </span>
                            <div style={{marginTop: '6px', fontWeight: 700}}>
                              Score: {a.score} / {a.max_score}
                            </div>
                            {a.feedback && (
                              <small style={{
                                display: 'block',
                                marginTop: '5px',
                                whiteSpace: 'normal',
                                maxWidth: '240px'
                              }}>
                                Feedback: {a.feedback}
                              </small>
                            )}
                          </div>
                        ) : (
                          <span className="status status-pending">
                            Submitted — Awaiting grade
                          </span>
                        )
                      ) : (
                        <span className="status status-neutral">
                          Published
                        </span>
                      )}
                    </td>

                    <td>
                      {student ? (
                        <button
                          className="text-button"
                          onClick={() => {
                            setSelectedAssignment(a);
                            setModal('submit');
                          }}
                        >
                          {a.submission_id ? 'View / Update' : 'Submit'}
                          <ArrowUpRight size={14}/>
                        </button>
                      ) : (
                        <button
                          className="text-button"
                          onClick={() => {
                            setSelectedAssignment(a);
                            setModal('');
                            setModal('submissions');
                          }}
                        >
                          Review <ArrowUpRight size={14}/>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty
          icon={ClipboardList}
          title="No assignments yet"
          text={student
            ? 'Assignments for your enrolled courses will appear here.'
            : 'Create an assignment for one of your courses.'}
        />
      )}
    </div>
  );
}


function UsersPage({users,onRole}) {
  return <div className="panel"><div className="panel-heading"><div><h3>Workspace users</h3><p>Review accounts and manage their access roles.</p></div><span className="result-count">{users.length} users</span></div><div className="table-wrap"><table><thead><tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td><div className="table-title"><div className="avatar avatar-small">{initials(u.name)}</div><b>{u.name}</b></div></td><td>{u.email}</td><td><select className="role-select" value={u.role} onChange={e=>onRole(u.id,e.target.value)}><option value="student">Student</option><option value="teacher">Teacher</option><option value="admin">Admin</option></select></td><td>{dateLabel(u.created_at)}</td></tr>)}</tbody></table></div></div>;
}
function SubmissionPage({assignments,onOpen}) {
  return <div className="panel"><div className="panel-heading"><div><h3>Review submissions</h3><p>Choose an assignment to review learner work and enter grades.</p></div></div>{assignments.length?<div className="assignment-list">{assignments.map(a=><div className="assignment-row submission-select" key={a.id}><div className="assignment-mark"><FileText size={18}/></div><div className="assignment-copy"><b>{a.title}</b><span>{a.course_title} · {a.max_score} points</span></div><button className="btn btn-outline btn-small" onClick={()=>onOpen(a)}>View submissions <ArrowUpRight size={15}/></button></div>)}</div>:<Empty icon={ClipboardList} title="No assignments available" text="Create an assignment before reviewing submissions."/>}</div>;
}
function Empty({icon:Icon,title,text}) { return <div className="empty-state"><div className="empty-icon"><Icon size={23}/></div><b>{title}</b><p>{text}</p></div>; }

function ModalShell({title,subtitle,onClose,children}) { return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="modal"><div className="modal-header"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="icon-btn" onClick={onClose}><X/></button></div>{children}</div></div>; }
function CourseModal({onClose,onSave}) {
  const [form,setForm]=useState({title:'',category:'Computer Science',description:'',price_paise:0});const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  async function submit(e){e.preventDefault();setBusy(true);setError('');try{await onSave(form)}catch(err){setError(err.message)}finally{setBusy(false)}}
  return <ModalShell title="Create a course" subtitle="Set up a new space for learners." onClose={onClose}><form className="modal-form" onSubmit={submit}><label>Course title<input required minLength="3" maxLength="180" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Introduction to Python"/></label><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>Computer Science</option><option>Business</option><option>Mathematics</option><option>Design</option><option>Languages</option><option>General</option></select></label><label>Description<textarea rows="4" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="What will learners gain from this course?"/></label><label>Price in INR (0 = free)<input type="number" min="0" step="1" value={Number(form.price_paise)/100} onChange={e=>setForm({...form,price_paise:Math.round(Number(e.target.value||0)*100)})}/></label>{error&&<div className="error-box">{error}</div>}<div className="modal-actions"><button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy?'Creating…':'Create course'} <Plus size={16}/></button></div></form></ModalShell>;
}
function AssignmentModal({courses,onClose,onSave}) {
  const [form,setForm]=useState({course_id:courses[0]?.id||'',title:'',description:'',due_date:'',max_score:100});const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  async function submit(e){e.preventDefault();setBusy(true);setError('');try{await onSave({...form,course_id:Number(form.course_id),due_date:form.due_date?new Date(form.due_date).toISOString():null,max_score:Number(form.max_score)})}catch(err){setError(err.message)}finally{setBusy(false)}}
  return <ModalShell title="New assignment" subtitle="Give learners a clear task and deadline." onClose={onClose}><form className="modal-form" onSubmit={submit}><label>Course<select required value={form.course_id} onChange={e=>setForm({...form,course_id:e.target.value})}>{courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select>{!courses.length&&<small>Create a course first.</small>}</label><label>Assignment title<input required minLength="3" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Week 1 project"/></label><label>Instructions<textarea rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Explain what students need to do."/></label><div className="form-two"><label>Due date<input type="datetime-local" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})}/></label><label>Max score<input type="number" min="1" step="0.5" required value={form.max_score} onChange={e=>setForm({...form,max_score:e.target.value})}/></label></div>{error&&<div className="error-box">{error}</div>}<div className="modal-actions"><button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={busy||!courses.length}>{busy?'Publishing…':'Publish assignment'} <Send size={16}/></button></div></form></ModalShell>;
}

function SubmitModal({assignment,onClose,onSave}) {
  const [answer,setAnswer] = useState('');
  const [file,setFile] = useState(null);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');

  async function submit(e) {
    e.preventDefault();

    if (!answer.trim() && !file) {
      setError('Write an answer or choose a PDF/Word file.');
      return;
    }

    if (file && file.size > 20 * 1024 * 1024) {
      setError('File must be 20 MB or smaller.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      await onSave({answer,file});
    } catch(err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalShell
      title="Submit assignment"
      subtitle={`${assignment.title} · ${assignment.course_title}`}
      onClose={onClose}
    >
      <form className="modal-form" onSubmit={submit}>
        <div className="assignment-instructions">
          {assignment.description || 'Your instructor has not added detailed instructions.'}
          <div>
            <Clock3 size={14}/> Due {dateLabel(assignment.due_date)} · {assignment.max_score} points
          </div>
        </div>

        <label>
          Your answer (optional if uploading a file)
          <textarea
            rows="7"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Write your response here…"
          />
        </label>

        <label>
          Upload PDF or Word document
          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={e => setFile(e.target.files?.[0] || null)}
          />
        </label>

        <small>Maximum file size: 20 MB. Allowed formats: PDF and DOCX.</small>

        {file && (
          <div className="assignment-instructions">
            Selected file: {file.name}
            <button
              type="button"
              className="text-button"
              onClick={() => setFile(null)}
            >
              Remove file
            </button>
          </div>
        )}

        {error && <div className="error-box">{error}</div>}

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Submitting…' : 'Submit work'} <Send size={16}/>
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function SubmissionsModal({assignment,submissions,onClose,onGrade}) {
  return <ModalShell title="Assignment submissions" subtitle={`${assignment.title} · ${submissions.length} submission(s)`} onClose={onClose}><div className="submission-modal-list">{submissions.length?submissions.map(s=><GradeRow key={s.id} submission={s} onGrade={onGrade}/>):<Empty icon={FileText} title="No submissions yet" text="Student submissions will appear here when they are received."/>}</div></ModalShell>;
}

function GradeRow({submission,onGrade}) {
  const [score,setScore]=useState(submission.score??'');
  const [feedback,setFeedback]=useState(submission.feedback||'');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');

  async function save(){
    setBusy(true);
    setError('');
    try{
      await onGrade(submission.id,score,feedback);
    }catch(e){
      setError(e.message);
    }finally{
      setBusy(false);
    }
  }

  return (
    <div className="grade-row">
      <div className="grade-student">
        <div className="avatar avatar-small">
          {initials(submission.student_name)}
        </div>
        <div>
          <b>{submission.student_name}</b>
          <span>
            {submission.student_email} · {dateLabel(submission.submitted_at)}
          </span>
        </div>
      </div>

      <div className="answer-box">
        {submission.answer_text || 'No text answer provided.'}
      </div>

      {submission.file_original_name && (
        <div className="assignment-instructions">
          <b>Attached file:</b> {submission.file_original_name}
          {submission.file_size_bytes && (
            <span>
              {' '}({(submission.file_size_bytes / (1024 * 1024)).toFixed(2)} MB)
            </span>
          )}
          <div>
            
<button
  type="button"
  className="btn btn-outline btn-small"
  onClick={async () => {
    try {
      const token = localStorage.getItem('lms_token');
      const response = await fetch(
        `/api/submissions/${submission.id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Download failed.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = submission.file_original_name || 'submission-file';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  }}
>
  Download submitted file
</button>

          </div>
        </div>
      )}

      <div className="grade-fields">
        <label>
          Score (max {submission.max_score})
          <input
            type="number"
            min="0"
            max={submission.max_score}
            step="0.5"
            value={score}
            onChange={e=>setScore(e.target.value)}
            placeholder="Score"
          />
        </label>

        <label>
          Feedback
          <input
            value={feedback}
            onChange={e=>setFeedback(e.target.value)}
            placeholder="Optional feedback"
          />
        </label>

        <button
          className="btn btn-primary btn-small"
          disabled={busy||score===''}
          onClick={save}
        >
          {busy?'Saving…':'Save grade'} <Award size={15}/>
        </button>
      </div>

      {error&&<div className="error-box">{error}</div>}
    </div>
  );
}


export default App;
