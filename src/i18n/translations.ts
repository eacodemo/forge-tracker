export interface TranslationSet {
  code: string;
  name: string;
  flag: string;
  nav: Record<string, string>;
  months: string[];
  monthsShort: string[];
  dow: string[];
  dowFull: string[];
  onboarding: Record<string, string>;
  tracker: Record<string, string>;
  focus: Record<string, string>;
  stats: Record<string, string>;
  heatmap: Record<string, string>;
  gamify: Record<string, any>;
  manage: Record<string, string>;
  settings: Record<string, string>;
  footer: Record<string, string>;
  greeting: Record<string, string>;
  notif: Record<string, string>;
  catNames: Record<string, string>;
  errorBoundary: Record<string, string>;
}

export const LANGS: Record<string, TranslationSet> = {
  es: {
    code: "es", name: "Español", flag: "🇪🇸",
    nav: { tracker:"Tracker", today:"Hoy", stats:"Stats", heatmap:"Heatmap", xp:"XP", habits:"Hábitos" },
    months: ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],
    monthsShort: ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"],
    dow: ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"],
    dowFull: ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"],
    onboarding: {
      welcome: "Bienvenido a Forge",
      sub: "Tu tracker de hábitos personal. Vamos a configurar todo en 3 pasos.",
      step1: "¿Cómo te llamas?", step1ph: "Tu nombre o apodo",
      step2: "Elige tu idioma", step3: "Personaliza tu app",
      step4: "Primeros hábitos",
      themeDark: "Oscuro", themeLight: "Claro",
      accentLabel: "Color de acento",
      notifLabel: "Hora de recordatorio diario",
      templateTitle: "Empieza con una plantilla",
      templateSkip: "Empezar vacío",
      templateProd: "Productividad", templateHealth: "Salud", templateMind: "Mente",
      next: "Siguiente", back: "Atrás", finish: "¡Empezar!", theme: "Tema",
    },
    tracker: { habit:"Hábito", completedDay:"Completadas / día", notesDay:"Notas del día", search:"Filtrar hábitos…", empty:"Sin hábitos todavía", emptyHint:"Ve a {settings} para agregar tu primer hábito." },
    focus: { mode:"Modo Focus", perfectDay:"¡Día perfecto! Todos los hábitos completados. 🏆", consecutive:"días seguidos", onlyCurrentMonth:"El modo Focus solo funciona en el mes actual.", empty:"No hay hábitos programados para este día." },
    stats: {
      compliance:"Cumplimiento", perfectDays:"Días perfectos", activeDays:"Días activos",
      habitsAbove:"Hábitos ≥ 80%", avgDay:"Prom / día", bestHabit:"Mejor hábito",
      improve:"A mejorar", ranking:"Ranking del mes", byCategory:"Por categoría",
      dailyProgress:"Progreso diario", habits:"hábitos",
      noHabits:"Agrega hábitos para ver estadísticas.", vsPrev:"vs mes anterior",
      weeklyBreakdown:"Resumen semanal", days:"días",
      period:"Período", periodMonth:"Mensual", periodQuarter:"Trimestral", periodSemester:"Semestral",
    },
    heatmap: { annualActivity:"Actividad anual", cellInfo:"Cada celda = 1 día · Color = % completados · Click para ir al mes", less:"Menos", more:"Más", monthly:"Resumen mensual", empty:"Sin datos de actividad. Agrega hábitos para ver tu mapa de calor." },
    gamify: { level:"Nivel", totalXP:"XP total", badges:"Badges", nextLevel:"XP para", maxLevel:"Nivel máximo alcanzado", youAreHere:"← TÚ", roadmap:"Mapa de niveles", levelNames:["Iniciado","Constante","Disciplinado","Imparable","Élite","Leyenda","Maestro"], totalChecks:"Checks totales", maxStreak:"Racha máxima", perfectDaysG:"Días perfectos", perfectWeeks:"Semanas perf.", activeDaysG:"Días activos", earned:"GANADO", lv:"Nv.", repaired:"Datos reparados automáticamente" },
    manage: {
      title:"Hábitos", newHabit:"+ Nuevo hábito", save:"Guardar", cancel:"Cancelar",
      name:"Nombre del hábito…", typeNormal:"Normal", typeNeg:"Negativo", typeNum:"Numérico",
      descNormal:"✓ Marcar cuando lo haces", descNeg:"⚠ Marcar cuando FALLAS", descNum:"# Meta por cantidad",
      categories:"Categorías", typesLegend:"Tipos de hábito", data:"Datos",
      exportJSON:"Export JSON", exportCSV:"Export CSV", importJSON:"Import JSON",
      testNotif:"Test notificación", notifDesktopOnly:"Solo disponible en app de escritorio",
      danger:"Zona peligrosa", deleteAll:"Borrar todos los datos", deleteConfirm:"¿Borrar TODOS los datos? Irreversible.",
      backupWarning:"⚠️ Importar sobreescribirá todos los datos actuales. Exporta primero.",
      deleteHabitConfirm:"¿Eliminar este hábito? Se perderán sus datos históricos.",
      toastAdded:"agregado", toastUpdated:"Hábito actualizado", toastDeleted:"Hábito eliminado",
      toastExportJSON:"Backup JSON exportado", toastExportCSV:"CSV exportado", toastImported:"Datos importados",
      toastNotif:"Notificación enviada",
      schedDaily:"Diario", schedWeekdays:"Días de semana", schedInterval:"Cada X días",
      schedDays:"Días", schedEvery:"Cada", schedDays2:"días", schedStartDay:"Empieza día",
      config:"Config", confirmLabel:"Eliminar",
    },
    settings: { title:"Configuración", lang:"Idioma", theme:"Tema", accent:"Color de acento", notifTime:"Hora de recordatorio", profile:"Perfil", username:"Tu nombre", save:"Guardar cambios", saved:"¡Guardado!" },
    footer: { createdBy:"Creado por", license:"MIT License" },
    greeting: { morning:"Buenos días", afternoon:"Buenas tardes", evening:"Buenas noches" },
    notif: { title:"Forge — Repaso del día 🎯", perfect:"¡Completaste todos los hábitos! 🏆", progress:"Llevas {done}/{total} ({pct}%). ¡Sigue!" },
    catNames: { salud:"Salud", trabajo:"Trabajo", mente:"Mente", social:"Social", habitos:"Rutina", otro:"Otro" },
    errorBoundary: { title:"Algo salió mal", message:"Forge encontró un error inesperado. Tus datos están seguros. Puedes intentar recuperarte o reiniciar la vista.", detail:"Detalle técnico", retry:"Reintentar", reload:"Recargar app", nuke:"Limpiar datos", nukeTitle:"¿Borrar todos los datos?", nukeMessage:"Esta acción no se puede deshacer. Se eliminarán todos tus hábitos, checks y configuración.", confirmLabel:"Eliminar todo", cancelLabel:"Cancelar" },
  },
  en: {
    code: "en", name: "English", flag: "🇬🇧",
    nav: { tracker:"Tracker", today:"Today", stats:"Stats", heatmap:"Heatmap", xp:"XP", habits:"Habits" },
    months: ["January","February","March","April","May","June","July","August","September","October","November","December"],
    monthsShort: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    dow: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
    dowFull: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
    onboarding: {
      welcome: "Welcome to Forge",
      sub: "Your personal habit tracker. Let's set everything up in 3 steps.",
      step1: "What's your name?", step1ph: "Your name or nickname",
      step2: "Choose your language", step3: "Customize your app",
      step4: "First habits",
      themeDark: "Dark", themeLight: "Light",
      accentLabel: "Accent color",
      notifLabel: "Daily reminder time",
      templateTitle: "Start with a template",
      templateSkip: "Start empty",
      templateProd: "Productivity", templateHealth: "Health", templateMind: "Mindset",
      next: "Next", back: "Back", finish: "Let's go!", theme: "Theme",
    },
    tracker: { habit:"Habit", completedDay:"Completed / day", notesDay:"Day notes", search:"Filter habits…", empty:"No habits yet", emptyHint:"Go to {settings} to add your first habit." },
    focus: { mode:"Focus Mode", perfectDay:"Perfect day! All habits completed. 🏆", consecutive:"days in a row", onlyCurrentMonth:"Focus mode only works for the current month.", empty:"No habits scheduled for this day." },
    stats: {
      compliance:"Compliance", perfectDays:"Perfect days", activeDays:"Active days",
      habitsAbove:"Habits ≥ 80%", avgDay:"Avg / day", bestHabit:"Best habit",
      improve:"To improve", ranking:"Month ranking", byCategory:"By category",
      dailyProgress:"Daily progress", habits:"habits",
      noHabits:"Add habits to see statistics.", vsPrev:"vs prev month",
      weeklyBreakdown:"Weekly breakdown", days:"days",
      period:"Period", periodMonth:"Monthly", periodQuarter:"Quarterly", periodSemester:"Semester",
    },
    heatmap: { annualActivity:"Annual activity", cellInfo:"Each cell = 1 day · Color = % completed · Click to go to month", less:"Less", more:"More", monthly:"Monthly summary", empty:"No activity data. Add habits to see your heatmap." },
    gamify: { level:"Level", totalXP:"total XP", badges:"Badges", nextLevel:"XP to", maxLevel:"Max level reached", youAreHere:"← YOU", roadmap:"Level roadmap", levelNames:["Beginner","Steady","Disciplined","Unstoppable","Elite","Legend","Master"], totalChecks:"Total checks", maxStreak:"Max streak", perfectDaysG:"Perfect days", perfectWeeks:"Perfect weeks", activeDaysG:"Active days", earned:"EARNED", lv:"Lv.", repaired:"Data automatically repaired" },
    manage: {
      title:"Habits", newHabit:"+ New habit", save:"Save", cancel:"Cancel",
      name:"Habit name…", typeNormal:"Normal", typeNeg:"Negative", typeNum:"Numeric",
      descNormal:"✓ Mark when you do it", descNeg:"⚠ Mark when you FAIL", descNum:"# Quantity goal",
      categories:"Categories", typesLegend:"Habit types", data:"Data",
      exportJSON:"Export JSON", exportCSV:"Export CSV", importJSON:"Import JSON",
      testNotif:"Test notification", notifDesktopOnly:"Only available in desktop app",
      danger:"Danger zone", deleteAll:"Delete all data", deleteConfirm:"Delete ALL data? Irreversible.",
      backupWarning:"⚠️ Importing will overwrite all current data. Export first.",
      deleteHabitConfirm:"Delete this habit? Historical data will be lost.",
      toastAdded:"added", toastUpdated:"Habit updated", toastDeleted:"Habit deleted",
      toastExportJSON:"JSON backup exported", toastExportCSV:"CSV exported", toastImported:"Data imported",
      toastNotif:"Notification sent",
      schedDaily:"Daily", schedWeekdays:"Weekdays", schedInterval:"Every X days",
      schedDays:"Days", schedEvery:"Every", schedDays2:"days", schedStartDay:"Start day",
      config:"Config", confirmLabel:"Delete",
    },
    settings: { title:"Settings", lang:"Language", theme:"Theme", accent:"Accent color", notifTime:"Reminder time", profile:"Profile", username:"Your name", save:"Save changes", saved:"Saved!" },
    footer: { createdBy:"Created by", license:"MIT License" },
    greeting: { morning:"Good morning", afternoon:"Good afternoon", evening:"Good evening" },
    notif: { title:"Forge — Daily check 🎯", perfect:"All habits completed today! 🏆", progress:"You have {done}/{total} ({pct}%). Keep going!" },
    catNames: { salud:"Health", trabajo:"Work", mente:"Mind", social:"Social", habitos:"Routine", otro:"Other" },
    errorBoundary: { title:"Something went wrong", message:"Forge encountered an unexpected error. Your data is safe. You can try to recover or restart the view.", detail:"Technical details", retry:"Retry", reload:"Reload app", nuke:"Clear data", nukeTitle:"Delete all data?", nukeMessage:"This action cannot be undone. All your habits, checks, and settings will be removed.", confirmLabel:"Delete all", cancelLabel:"Cancel" },
  },
  pt: {
    code: "pt", name: "Português", flag: "🇧🇷",
    nav: { tracker:"Tracker", today:"Hoje", stats:"Stats", heatmap:"Heatmap", xp:"XP", habits:"Hábitos" },
    months: ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
    monthsShort: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],
    dow: ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"],
    dowFull: ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"],
    onboarding: {
      welcome: "Bem-vindo ao Forge",
      sub: "Seu tracker de hábitos pessoal. Vamos configurar tudo em 3 passos.",
      step1: "Qual é o seu nome?", step1ph: "Seu nome ou apelido",
      step2: "Escolha seu idioma", step3: "Personalize seu app",
      step4: "Primeiros hábitos",
      themeDark: "Escuro", themeLight: "Claro",
      accentLabel: "Cor de destaque",
      notifLabel: "Hora do lembrete diário",
      templateTitle: "Comece com um modelo",
      templateSkip: "Começar vazio",
      templateProd: "Produtividade", templateHealth: "Saúde", templateMind: "Mente",
      next: "Próximo", back: "Voltar", finish: "Vamos lá!", theme: "Tema",
    },
    tracker: { habit:"Hábito", completedDay:"Concluídos / dia", notesDay:"Notas do dia", search:"Filtrar hábitos…", empty:"Nenhum hábito ainda", emptyHint:"Vá para {settings} para adicionar seu primeiro hábito." },
    focus: { mode:"Modo Foco", perfectDay:"Dia perfeito! Todos os hábitos concluídos. 🏆", consecutive:"dias seguidos", onlyCurrentMonth:"O modo Foco só funciona no mês atual.", empty:"Nenhum hábito agendado para este dia." },
    stats: {
      compliance:"Cumprimento", perfectDays:"Dias perfeitos", activeDays:"Dias ativos",
      habitsAbove:"Hábitos ≥ 80%", avgDay:"Média / dia", bestHabit:"Melhor hábito",
      improve:"Melhorar", ranking:"Ranking do mês", byCategory:"Por categoria",
      dailyProgress:"Progresso diário", habits:"hábitos",
      noHabits:"Adicione hábitos para ver estatísticas.", vsPrev:"vs mês anterior",
      weeklyBreakdown:"Resumo semanal", days:"dias",
      period:"Período", periodMonth:"Mensal", periodQuarter:"Trimestral", periodSemester:"Semestral",
    },
    heatmap: { annualActivity:"Atividade anual", cellInfo:"Cada célula = 1 dia · Cor = % concluídos · Clique para ir ao mês", less:"Menos", more:"Mais", monthly:"Resumo mensal", empty:"Sem dados de atividade. Adicione hábitos para ver seu mapa de calor." },
    gamify: { level:"Nível", totalXP:"XP total", badges:"Conquistas", nextLevel:"XP para", maxLevel:"Nível máximo atingido", youAreHere:"← VOCÊ", roadmap:"Mapa de níveis", levelNames:["Iniciante","Constante","Disciplinado","Imparável","Elite","Lenda","Mestre"], totalChecks:"Checks totais", maxStreak:"Sequência máx", perfectDaysG:"Dias perfeitos", perfectWeeks:"Semanas perf.", activeDaysG:"Dias ativos", earned:"GANHO", lv:"Nv.", repaired:"Dados reparados automaticamente" },
    manage: {
      title:"Hábitos", newHabit:"+ Novo hábito", save:"Salvar", cancel:"Cancelar",
      name:"Nome do hábito…", typeNormal:"Normal", typeNeg:"Negativo", typeNum:"Numérico",
      descNormal:"✓ Marcar quando fizer", descNeg:"⚠ Marcar quando FALHAR", descNum:"# Meta por quantidade",
      categories:"Categorias", typesLegend:"Tipos de hábito", data:"Dados",
      exportJSON:"Exportar JSON", exportCSV:"Exportar CSV", importJSON:"Importar JSON",
      testNotif:"Testar notificação", notifDesktopOnly:"Só disponível no app desktop",
      danger:"Zona perigosa", deleteAll:"Apagar todos os dados", deleteConfirm:"Apagar TODOS os dados? Irreversível.",
      backupWarning:"⚠️ Importar sobrescreverá todos os dados atuais. Exporte primeiro.",
      deleteHabitConfirm:"Excluir este hábito? Os dados históricos serão perdidos.",
      toastAdded:"adicionado", toastUpdated:"Hábito atualizado", toastDeleted:"Hábito excluído",
      toastExportJSON:"Backup JSON exportado", toastExportCSV:"CSV exportado", toastImported:"Dados importados",
      toastNotif:"Notificação enviada",
      schedDaily:"Diário", schedWeekdays:"Dias úteis", schedInterval:"A cada X dias",
      schedDays:"Dias", schedEvery:"A cada", schedDays2:"dias", schedStartDay:"Começa dia",
      config:"Config", confirmLabel:"Excluir",
    },
    settings: { title:"Configurações", lang:"Idioma", theme:"Tema", accent:"Cor de destaque", notifTime:"Hora do lembrete", profile:"Perfil", username:"Seu nome", save:"Salvar alterações", saved:"Salvo!" },
    footer: { createdBy:"Criado por", license:"MIT License" },
    greeting: { morning:"Bom dia", afternoon:"Boa tarde", evening:"Boa noite" },
    notif: { title:"Forge — Revisão do dia 🎯", perfect:"Todos os hábitos concluídos hoje! 🏆", progress:"Você tem {done}/{total} ({pct}%). Continue!" },
    catNames: { salud:"Saúde", trabajo:"Trabalho", mente:"Mente", social:"Social", habitos:"Rotina", outro:"Outro" },
    errorBoundary: { title:"Algo deu errado", message:"Forge encontrou um erro inesperado. Seus dados estão seguros. Você pode tentar se recuperar ou reiniciar a visualização.", detail:"Detalhes técnicos", retry:"Tentar novamente", reload:"Recarregar app", nuke:"Limpar dados", nukeTitle:"Apagar todos os dados?", nukeMessage:"Esta ação não pode ser desfeita. Todos os seus hábitos, verificações e configurações serão removidos.", confirmLabel:"Apagar tudo", cancelLabel:"Cancelar" },
  },
};

export const DAYS_IN_MONTH = (y: number, m: number): number => new Date(y, m + 1, 0).getDate();
