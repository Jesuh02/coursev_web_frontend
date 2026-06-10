<template>
  <div class="chat-root">

    <!-- ── Header (WhatsApp style) ── -->
    <div class="chat-header">
      <button class="hdr-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>

      <div class="hdr-avatar">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
        <span class="hdr-status-dot" />
      </div>



      <div class="hdr-info">
        <p class="hdr-name">Asistente LLM</p>
        <p class="hdr-sub">DeepSeek · en línea</p>
      </div>

      <div class="hdr-actions">
        <button class="hdr-btn" @click="openStudentProgressOverlay" title="Progreso de estudiantes">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        </button>
        <button class="hdr-btn" @click="showGradedOverlay = true" title="Tareas calificadas">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 11 12 14 22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        </button>
        <button class="hdr-btn" @click="clearChat" title="Limpiar chat">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- ── Active context pill ── -->
    <Transition name="ctx-slide">
      <div v-if="selectedProgressContext && !selectedTask" class="ctx-bar ctx-bar--progress">
        <div class="ctx-bar-left">
          <span class="ctx-bar-accent ctx-bar-accent--progress" />
          <div>
            <p class="ctx-task">📊 {{ selectedProgressContext.courseName }}</p>
            <p class="ctx-student">Contexto de progreso activo</p>
          </div>
        </div>
        <button class="ctx-remove" @click="clearProgressContext">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </Transition>
    <Transition name="ctx-slide">
      <div v-if="selectedTask" class="ctx-bar">
        <div class="ctx-bar-left">
          <span class="ctx-bar-accent" />
          <div>
            <p class="ctx-task">{{ selectedTask.taskName }}</p>
            <p class="ctx-student">{{ selectedTask.studentName }}</p>
          </div>
        </div>
        <button class="ctx-remove" @click="clearContext">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </Transition>

    <!-- ── Messages ── -->
    <div ref="messagesContainer" class="messages-area" @scroll="onContainerScroll">

      <!-- Welcome empty state -->
      <div v-if="!messages.length" class="empty-state">
        <p class="empty-title">¿En qué puedo ayudarte?</p>
        <div class="quick-chips">
          <button class="quick-chip" @click="insertSuggestion('¿Cómo está el progreso general de mis estudiantes?')">
            <span class="chip-icon chip-icon--blue">📊</span>
            <span class="chip-text">Progreso general</span>
          </button>
          <button class="quick-chip" @click="insertSuggestion('¿Qué estudiantes tienen riesgo de reprobar?')">
            <span class="chip-icon chip-icon--amber">⚠️</span>
            <span class="chip-text">En riesgo</span>
          </button>
          <button class="quick-chip" @click="insertSuggestion('¿Cuál es el promedio de calificaciones de mis cursos?')">
            <span class="chip-icon chip-icon--green">🏆</span>
            <span class="chip-text">Promedios</span>
          </button>
          <button class="quick-chip" @click="insertSuggestion('Escribe # para calificar una entrega de estudiante')">
            <span class="chip-icon chip-icon--purple">✅</span>
            <span class="chip-text">Calificar entrega</span>
          </button>
        </div>
      </div>

      <!-- Message bubbles -->
      <template v-for="msg in messages" :key="msg.id">
        <!-- ── Regular message bubble (skip legacy isPlanCard placeholders) ── -->
        <template v-if="!msg.isPlanCard">
        <div class="msg-row" :class="msg.role === 'user' ? 'msg-row--user' : 'msg-row--bot'">

          <!-- Bot avatar dot -->
          <div v-if="msg.role === 'assistant'" class="msg-bot-avatar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </div>

          <div class="bubble" :class="msg.role === 'user' ? 'bubble--user' : 'bubble--bot'">
            <div class="bubble-text" v-html="renderMarkdown(msg.content)" />
            <span class="bubble-time">{{ formatTime(msg.createdAt) }}</span>
            <!-- Read tick for user -->
            <span v-if="msg.role === 'user'" class="bubble-ticks">
              <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                <path d="M1 5l3 3 5-6" stroke="#7DD3FC" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M5 5l3 3 5-6" stroke="#7DD3FC" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </div>
        </div>

        <!-- Message action bar below bot messages -->
        <div v-if="msg.role === 'assistant'" class="msg-actions">
          <button class="msg-action-btn" :class="{ 'msg-action-btn--active': copiedMsgId === msg.id }" @click="copyMessage(msg)" :title="copiedMsgId === msg.id ? 'Copiado' : 'Copiar'">
            <svg v-if="copiedMsgId !== msg.id" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
          <button class="msg-action-btn" :class="{ 'msg-action-btn--liked': likedMsgId === msg.id }" @click="likeMessage(msg)" title="Me gusta">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
          </button>
          <button class="msg-action-btn" :class="{ 'msg-action-btn--disliked': dislikedMsgId === msg.id }" @click="dislikeMessage(msg)" title="No me gusta">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
          </button>
          <button class="msg-action-btn" @click="shareMessage(msg)" title="Compartir">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
        </div>

        <!-- Excel download button below bot message -->
        <div
          v-if="msg.role === 'assistant' && msg.excelUrl"
          class="grade-actions"
        >
          <a :href="msg.excelUrl" target="_blank" rel="noopener noreferrer" class="grade-btn grade-btn--excel">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            Descargar Excel de progreso
          </a>
        </div>

        <!-- Grade actions below bot message -->
        <div
          v-if="msg.role === 'assistant' && !msg.calificationAdded && messageHasGrade(msg)"
          class="grade-actions"
        >
          <button class="grade-btn grade-btn--accept" @click="addGrade(msg)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Agregar calificación{{ msg.nota != null ? ` (${msg.nota}/10)` : '' }}
          </button>
          <button class="grade-btn grade-btn--reject" @click="rejectGrade(msg)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Rechazar
          </button>
        </div>
        <div v-if="msg.role === 'assistant' && (msg.esCalificacion || msg.nota != null) && msg.calificationAdded" class="grade-done">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#30D158" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Calificación aplicada
        </div>
        </template><!-- end regular message -->

        <!-- Plan card rendered inline at the isPlanCard marker position -->
        <CoursePlanCard
          v-if="msg.isPlanCard && coursePlan"
          :plan="coursePlan"
          :creating="isCreatingCourse"
          :created-id="createdCourseId"
          :error="courseCreateError"
          :version="planVersion"
          @confirm="createCourseFromPlan"
          @reject="rejectCoursePlan"
          @view="viewCreatedCourse"
        />
      </template>

      <!-- Fallback: show card if coursePlan is active but no inline marker exists -->
      <CoursePlanCard
        v-if="coursePlan && !hasInlinePlanCard"
        :plan="coursePlan"
        :creating="isCreatingCourse"
        :created-id="createdCourseId"
        :error="courseCreateError"
        :version="planVersion"
        @confirm="createCourseFromPlan"
        @reject="rejectCoursePlan"
        @view="viewCreatedCourse"
      />

      <!-- Typing indicator -->
      <div v-if="isTyping" class="msg-row msg-row--bot">
        <div class="msg-bot-avatar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </div>
        <div class="bubble bubble--bot bubble--typing">
          <span class="dot" /><span class="dot" /><span class="dot" />
        </div>
      </div>

      <!-- Bottom anchor -->
      <div class="scroll-anchor" />
    </div>

    <!-- ── Scroll to bottom FAB ── -->
    <Transition name="fab-pop">
      <button v-if="showScrollBtn" class="fab-scroll" @click="scrollToBottom">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
    </Transition>

    <!-- ── Course mode banner ── -->
    <div v-if="isCourseMode" class="course-mode-banner">
      <div class="cm-icon">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      </div>
      <span class="cm-text">
        <span v-if="coursePlan">Plan listo · ajusta por chat o confirma para crearlo</span>
        <span v-else>Modo curso · describe la temática o pega tu planificación</span>
      </span>
      <button class="cm-close" @click="isCourseMode = false; coursePlan = null; clearPersistedPlan(); clearPersistedCourseDraft()" title="Salir del modo curso">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- ── Input bar ── -->
    <div class="input-bar">
      <!-- Image preview bar -->
      <div v-if="pendingImage" class="img-preview-bar">
        <img :src="pendingImage" class="img-preview-thumb" alt="preview" />
        <span class="img-preview-name">{{ pendingImageName }}</span>
        <button class="img-preview-remove" @click="clearPendingImage" title="Quitar imagen">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="input-wrap">
        <!-- Hidden file input for images -->
        <input
          ref="imageInputRef"
          type="file"
          accept="image/*"
          style="display: none"
          @change="onImageSelected"
        />
        <button
          class="send-btn send-btn--attach"
          title="Adjuntar imagen"
          @click="imageInputRef?.click()"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </button>
        <textarea
          ref="inputRef"
          v-model="inputText"
          class="msg-input"
          placeholder="Escribe un mensaje o # para tareas…"
          rows="1"
          @keydown.enter.exact.prevent="sendMessage"
          @input="onInputChange"
          @keyup="onInputChange"
          @click="onInputChange"
        />
      </div>
      <button
        v-if="inputText.trim() && !isTyping"
        class="send-btn send-btn--active"
        @click="sendMessage"
        title="Enviar mensaje"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
      <button
        v-else
        class="send-btn"
        :class="isRecording ? 'send-btn--recording' : 'send-btn--mic'"
        :disabled="isTyping"
        :title="isRecording ? 'Detener grabación' : 'Hablar al chat'"
        @click="toggleRecording"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
          <path v-if="!isRecording" d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"/>
          <path v-if="!isRecording" d="M19 11a7 7 0 0 1-14 0"/>
          <line v-if="!isRecording" x1="12" y1="18" x2="12" y2="21"/>
          <line v-if="!isRecording" x1="8" y1="21" x2="16" y2="21"/>
          <rect v-else x="7" y="7" width="10" height="10" rx="2" fill="currentColor" stroke="none"/>
        </svg>
      </button>
    </div>

    <!-- ══════════════════════════════════════
         TASK SELECTOR OVERLAY (# trigger)
    ══════════════════════════════════════ -->
    <Transition name="sheet-up">
      <div v-if="showTaskOverlay" class="sheet-backdrop" @click.self="closeTaskOverlay">
        <div class="sheet-panel">
          <div class="sheet-handle" />
          <div class="sheet-header">
            <span class="sheet-title">{{ isSelectingCourse ? 'Seleccionar curso' : 'Seleccionar entrega' }}</span>
            <button class="sheet-close" @click="closeTaskOverlay">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="sheet-search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              v-model="overlayQuery"
              class="sheet-search-input"
              :placeholder="isSelectingCourse ? 'Buscar curso...' : 'Buscar tarea o estudiante...'"
              @input="filterOverlay"
            />
          </div>

          <button v-if="!isSelectingCourse" class="sheet-back" @click="goBackToCourses">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Volver a cursos
          </button>

          <div class="sheet-list">
            <!-- Skeleton -->
            <template v-if="overlayLoading">
              <div v-for="i in 4" :key="i" class="sheet-skel">
                <div class="skel-icon" />
                <div class="skel-text">
                  <div class="skel-line skel-title" />
                  <div class="skel-line skel-sub" />
                </div>
              </div>
            </template>

            <!-- Items -->
            <template v-else>
              <button
                v-for="item in filteredOverlayItems"
                :key="item.id"
                class="sheet-item"
                @click="selectOverlayItem(item)"
              >
                <div class="sheet-item-icon">
                  <svg v-if="isSelectingCourse" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div class="sheet-item-info">
                  <span class="sheet-item-title">{{ item.title }}</span>
                  <span v-if="item.subtitle" class="sheet-item-sub">{{ item.subtitle }}</span>
                </div>
                <span v-if="item.grade != null" class="sheet-item-grade">{{ item.grade }}/10</span>
                <svg v-else class="sheet-item-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
              <div v-if="!filteredOverlayItems.length" class="sheet-empty">
                Sin resultados
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ══════════════════════════════════════
         STUDENT PROGRESS OVERLAY
    ══════════════════════════════════════ -->
    <Transition name="sheet-up">
      <div v-if="showStudentProgressOverlay" class="sheet-backdrop" @click.self="closeStudentProgressOverlay">
        <div class="sheet-panel">
          <div class="sheet-handle" />
          <div class="sheet-header">
            <span class="sheet-title">Progreso de estudiantes</span>
            <button class="sheet-close" @click="closeStudentProgressOverlay">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="sheet-progress-actions">
            <p class="sheet-progress-hint">Selecciona un curso para usar su progreso como contexto en el chat</p>
            <button class="sheet-excel-btn" :disabled="exportingExcel" @click="exportAllProgressExcel" title="Exportar todos los cursos a Excel">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              {{ exportingExcel ? 'Generando…' : 'Exportar Excel' }}
            </button>
          </div>
          <div class="sheet-list">
            <template v-if="studentProgressLoading">
              <div v-for="i in 3" :key="i" class="sheet-skel">
                <div class="skel-icon" />
                <div class="skel-text">
                  <div class="skel-line skel-title" />
                  <div class="skel-line skel-sub" />
                </div>
              </div>
            </template>
            <div v-else-if="!studentProgressData.length" class="sheet-empty" style="padding: 32px 0;">
              No tienes cursos como creador o colaborador
            </div>
            <template v-else>
              <button
                v-for="course in studentProgressData"
                :key="course.courseId"
                class="sheet-item"
                @click="selectProgressCourse(course)"
              >
                <div class="sheet-item-icon">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                </div>
                <div class="sheet-item-info">
                  <span class="sheet-item-title">{{ course.courseName }}</span>
                  <span class="sheet-item-sub">{{ course.students.length }} estudiantes · Promedio {{ avgGrade(course) }}/10</span>
                </div>
                <svg class="sheet-item-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </template>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ══════════════════════════════════════
         GRADED TASKS OVERLAY
    ══════════════════════════════════════ -->
    <Transition name="sheet-up">
      <div v-if="showGradedOverlay" class="sheet-backdrop" @click.self="showGradedOverlay = false">
        <div class="sheet-panel">
          <div class="sheet-handle" />
          <div class="sheet-header">
            <span class="sheet-title">Tareas calificadas</span>
            <button class="sheet-close" @click="showGradedOverlay = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="sheet-list">
            <div v-if="!gradedTasks.length" class="sheet-empty" style="padding: 32px 0;">
              Sin calificaciones en esta sesión
            </div>
            <button
              v-for="g in gradedTasks"
              :key="g.submissionId"
              class="sheet-item"
              @click="loadGradedContext(g)"
            >
              <div class="sheet-item-icon">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <polyline points="9 11 12 14 22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              </div>
              <div class="sheet-item-info">
                <span class="sheet-item-title">{{ g.taskName }}</span>
                <span class="sheet-item-sub">{{ g.studentName }}</span>
              </div>
              <span class="sheet-item-grade">{{ g.grade }}/10</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { api, tokenStorage, chatAdapter, submissionAdapter, courseAdapter, taskAdapter, HttpError } from '@/infrastructure/api'
import type { Course, TaskSubmission, Task } from '@/domain/models'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import { useChatSocket, type ChatSocketMessage } from '@/composables/useChatSocket'
import CoursePlanCard, { type CoursePlan } from './components/CoursePlanCard.vue'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChatMsg {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  esCalificacion?: boolean
  nota?: number | null
  calificationAdded?: boolean
  excelUrl?: string | null
  submissionId?: number | null
  feedback?: string | null
  isPlanCard?: boolean
}

type CourseDraftField = 'topic' | 'area' | 'objective' | 'level' | 'durationWeeks' | 'hoursPerWeek' | 'studentProfile'

interface CourseCreationDraft {
  topic?: string
  area?: string
  objective?: string
  level?: string
  durationWeeks?: number | null
  hoursPerWeek?: number | null
  studentProfile?: string
  lastAskedField?: CourseDraftField | null
}

interface SelectedTaskCtx {
  submissionId: number
  taskId: number
  studentId: number
  fileUri: string | null
  taskName: string
  taskDescription: string
  studentName: string
  courseId: number
  courseName: string
}

interface OverlayItem {
  id: number
  title: string
  subtitle?: string
  grade?: number | null
  /** payload */
  courseId?: number
  submission?: TaskSubmission
  task?: Task
}

interface GradedEntry {
  submissionId: number
  taskName: string
  studentName: string
  grade: number
  feedback: string
}

interface StudentProgressItem {
  userId: number
  username: string
  avatar: string | null
  completedTasks: number
  totalTasks: number
  averageGrade: number
  progressPercentage: number
  status: string
}

interface StudentProgressData {
  courseId: number
  courseName: string
  students: StudentProgressItem[]
}

interface StudentProgressContext {
  courseId: number
  courseName: string
  summary: string
}

// ─── State ───────────────────────────────────────────────────────────────────

const authStore = useAuthStore()
const router = useRouter()

const messagesContainer = ref<HTMLElement>()
const inputRef = ref<HTMLTextAreaElement>()

const messages = ref<ChatMsg[]>([])
const inputText = ref('')
const isTyping = ref(false)
const isSending = ref(false)
const isRecording = ref(false)
const showScrollBtn = ref(false)
const sessionId = computed(() => `chatbot_llm_${tokenStorage.userId ?? 'anon'}`)

// Context
const selectedTask = ref<SelectedTaskCtx | null>(null)

// Task overlay
const showTaskOverlay = ref(false)
const overlayLoading = ref(false)
const overlayQuery = ref('')
const isSelectingCourse = ref(true)
const overlayItems = ref<OverlayItem[]>([])
const currentHashStart = ref(-1) // cursor position of the # char

// Courses cache
const coursesCache = ref<Course[]>([])

// Graded tasks
const showGradedOverlay = ref(false)
const gradedTasks = ref<GradedEntry[]>([])

// Image attachment for vision
const pendingImage = ref<string | null>(null) // base64 data URI
const pendingImageName = ref<string>('')
const imageInputRef = ref<HTMLInputElement>()

// Student progress
const showStudentProgressOverlay = ref(false)
const studentProgressLoading = ref(false)
const studentProgressData = ref<StudentProgressData[]>([])
const selectedProgressContext = ref<StudentProgressContext | null>(null)
const exportingExcel = ref(false)

// Message actions
const copiedMsgId = ref<string | null>(null)
const likedMsgId = ref<string | null>(null)
const dislikedMsgId = ref<string | null>(null)

// ─── Course plan mode ────────────────────────────────────────────────────────
const isCourseMode = ref(false)
const coursePlan = ref<CoursePlan | null>(null)
const planVersion = ref(0)
const isCreatingCourse = ref(false)
const createdCourseId = ref<number | null>(null)
const courseCreateError = ref('')
const courseDraft = ref<CourseCreationDraft>({})
let recognition: any = null
let voiceBaseText = ''

// Plan persistence: the CoursePlanCard lives only in memory while the announcement
// text message gets saved to the backend. Without persisting the plan itself, a page
// reload restores the "Aquí está tu plan de curso" text but loses the card. Keep the
// plan in localStorage (keyed per account) so the card reappears after reload.
const planStorageKey = computed(() => `chatbot_llm_plan_${tokenStorage.userId ?? 'anon'}`)
const courseDraftStorageKey = computed(() => `chatbot_llm_course_draft_${tokenStorage.userId ?? 'anon'}`)

function persistPlan() {
  try {
    if (coursePlan.value) {
      localStorage.setItem(
        planStorageKey.value,
        JSON.stringify({ plan: coursePlan.value, version: planVersion.value }),
      )
    } else {
      localStorage.removeItem(planStorageKey.value)
    }
  } catch { /* storage unavailable — non-fatal */ }
}

function clearPersistedPlan() {
  try { localStorage.removeItem(planStorageKey.value) } catch { /* non-fatal */ }
}

function normalizeCourseDraft(draft: CourseCreationDraft | undefined): CourseCreationDraft {
  if (!draft) return {}
  return {
    topic: draft.topic?.trim() || undefined,
    area: draft.area?.trim() || undefined,
    objective: draft.objective?.trim() || undefined,
    level: draft.level?.trim() || undefined,
    durationWeeks: draft.durationWeeks ?? null,
    hoursPerWeek: draft.hoursPerWeek ?? null,
    studentProfile: draft.studentProfile?.trim() || undefined,
    lastAskedField: draft.lastAskedField ?? null,
  }
}

function normalizeIntentText(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function inferCourseAreaFromDraft(draft: CourseCreationDraft): string | undefined {
  const n = normalizeIntentText(draft.objective || '')
  const knownFocus = n.match(/\b(machine learning|aprendizaje automatico|deep learning|inteligencia artificial|ia|ciencia de datos|data science)(?:\s+(?:con|usando|en)\s+python)?\b/)
  if (knownFocus) return knownFocus[0].trim()
  const pythonFocus = n.match(/\b([a-z0-9 ]{3,60}?\s+(?:con|usando|en)\s+python)\b/)
  if (pythonFocus) {
    return pythonFocus[1]
      .replace(/^(que\s+)?(mis\s+)?estudiantes\s+(tengan|aprendan|dominen)\s+(un\s+)?(conocimiento\s+)?(profundo\s+)?(de\s+)?/, '')
      .trim()
  }
  return undefined
}

function mergeCourseDraftValues(current: CourseCreationDraft, incoming: CourseCreationDraft | undefined): CourseCreationDraft {
  const merged = normalizeCourseDraft(current)
  const incomingDraft = normalizeCourseDraft(incoming)
  const shouldReplace = (currentValue?: string, incomingValue?: string) => {
    if (!incomingValue?.trim()) return false
    if (!currentValue?.trim()) return true
    const currentNorm = normalizeIntentText(currentValue)
    const incomingNorm = normalizeIntentText(incomingValue)
    if (currentNorm === incomingNorm) return false
    if (currentNorm.includes(incomingNorm) && incomingNorm.length < currentNorm.length) return false
    if (currentNorm.split(' ').length > incomingNorm.split(' ').length && incomingNorm.length < currentNorm.length) return false
    return true
  }
  for (const key of ['topic', 'area', 'objective', 'level', 'studentProfile', 'lastAskedField'] as const) {
    if (key === 'area' && !merged.area && merged.topic && incomingDraft.area) {
      const topicNorm = normalizeIntentText(merged.topic)
      const areaNorm = normalizeIntentText(incomingDraft.area)
      if (topicNorm.includes(areaNorm) && areaNorm.length < topicNorm.length) continue
    }
    if (shouldReplace(merged[key] as string | undefined, incomingDraft[key] as string | undefined)) {
      ;(merged as any)[key] = incomingDraft[key]
    }
  }
  for (const key of ['durationWeeks', 'hoursPerWeek'] as const) {
    const value = incomingDraft[key]
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      merged[key] = value
    }
  }
  if (!merged.area && (merged.objective || merged.durationWeeks || merged.level)) {
    merged.area = inferCourseAreaFromDraft(merged) || merged.topic
  }
  return normalizeCourseDraft(merged)
}

function mergeCourseDraftFromUserText(text: string, draft: CourseCreationDraft): CourseCreationDraft {
  const merged = normalizeCourseDraft(draft)
  const n = normalizeIntentText(text)
  const answersKnownField = Boolean(merged.lastAskedField && merged.lastAskedField !== 'topic')
  const areaMatch = n.match(/\b(?:area|especialidad|enfoque)\s+(?:de|en|sobre)\s+(.+?)(?=,|\.|$|\s+(?:objetivo|duracion|nivel)\b)/)
  if (areaMatch) {
    merged.area = areaMatch[1].trim()
    if (!merged.topic) merged.topic = merged.area
  }
  if (!merged.topic && !answersKnownField) {
    const topicMatch = n.match(/\bcurso\s+(?:de|sobre|para|acerca de|en el area de|del area de)\s+(.+?)(?=,|\.|$)/)
    merged.topic = (topicMatch?.[1] || n).trim()
  }
  const duration = n.match(/(\d{1,2})\s*(?:semanas?|weeks?)/)
  if (duration) merged.durationWeeks = Number(duration[1])
  if (/\b(avanzado|advanced|experto|profundo|profunda|profundidad|complejo|complejos)\b|buenas practicas/.test(n)) merged.level = 'advanced'
  else if (/\b(intermedio|intermediate|medio)\b/.test(n)) merged.level = 'intermediate'
  else if (/\b(principiante|basico|basic|beginner|inicial)\b/.test(n)) merged.level = 'beginner'

  if (merged.lastAskedField === 'objective' && text.trim()) merged.objective = text.trim()
  if (merged.lastAskedField === 'durationWeeks' && duration) merged.durationWeeks = Number(duration[1])
  if (merged.lastAskedField === 'level' && merged.level) merged.level = merged.level
  if (merged.lastAskedField === 'topic' && text.trim()) merged.topic = n
  if (!merged.area && (merged.objective || merged.durationWeeks || merged.level)) {
    merged.area = inferCourseAreaFromDraft(merged) || merged.topic
  }
  return normalizeCourseDraft(merged)
}

function persistCourseDraft() {
  try {
    const normalized = normalizeCourseDraft(courseDraft.value)
    const hasDraft = Object.values(normalized).some(value => value !== undefined && value !== null && value !== '')
    if (hasDraft) {
      localStorage.setItem(courseDraftStorageKey.value, JSON.stringify(normalized))
    } else {
      localStorage.removeItem(courseDraftStorageKey.value)
    }
  } catch { /* storage unavailable — non-fatal */ }
}

function clearPersistedCourseDraft() {
  courseDraft.value = {}
  try { localStorage.removeItem(courseDraftStorageKey.value) } catch { /* non-fatal */ }
}

function restorePersistedCourseDraft() {
  try {
    const raw = localStorage.getItem(courseDraftStorageKey.value)
    if (!raw) return
    const restored = normalizeCourseDraft(JSON.parse(raw))
    courseDraft.value = restored
    if (Object.values(restored).some(value => value !== undefined && value !== null && value !== '')) {
      isCourseMode.value = true
    }
  } catch { /* corrupt entry — ignore */ }
}

function buildCourseConversationHistory() {
  return messages.value
    .filter(m => !m.isPlanCard && (m.role === 'user' || m.role === 'assistant') && m.content.trim())
    .slice(-12)
    .map(m => ({ role: m.role, content: m.content }))
}

function restorePersistedPlan() {
  try {
    const raw = localStorage.getItem(planStorageKey.value)
    if (!raw) return
    const saved = JSON.parse(raw) as { plan?: CoursePlan; version?: number }
    if (saved?.plan && typeof saved.plan.title === 'string' && Array.isArray(saved.plan.subjects)) {
      coursePlan.value = saved.plan
      planVersion.value = typeof saved.version === 'number' ? saved.version : 1
      isCourseMode.value = true
      // The card lives inline at an isPlanCard marker in the message flow. History loaded
      // from the backend only restores the announcement text, so re-inject the marker
      // (deduped) to make the restored plan card reappear after a reload.
      if (!messages.value.some(m => m.isPlanCard)) {
        messages.value.push({
          id: `plan-card-v${planVersion.value}`,
          role: 'assistant',
          content: '',
          createdAt: new Date().toISOString(),
          isPlanCard: true,
        })
      }
    }
  } catch { /* corrupt entry — ignore */ }
}

// ─── Computed ─────────────────────────────────────────────────────────────────

const filteredOverlayItems = computed(() => {
  const q = overlayQuery.value.toLowerCase().trim()
  if (!q) return overlayItems.value
  return overlayItems.value.filter(
    item =>
      item.title.toLowerCase().includes(q) ||
      (item.subtitle ?? '').toLowerCase().includes(q),
  )
})

// True when an inline plan-card marker exists in the message flow. Used to avoid
// double-rendering the fallback card below the messages.
const hasInlinePlanCard = computed(() => messages.value.some(m => m.isPlanCard))

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(async () => {
  window.addEventListener('keydown', onKeydown)
  await loadHistoryFromBackend()
  // Re-hydrate the in-progress course plan so its card reappears after a reload.
  restorePersistedPlan()
  if (!coursePlan.value) restorePersistedCourseDraft()
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  stopRecording()
})

// ─── Real-time sync via Socket.io ─────────────────────────────────────────────

useChatSocket(tokenStorage.userId || null, 'chatbot_llm', (msg: ChatSocketMessage) => {
  const incomingRole = msg.isFromUser ? 'user' : 'assistant'
  const incomingContent = msg.message ?? ''
  // Avoid duplicates: match by backend id OR by role+content (optimistic local messages use
  // crypto.randomUUID() which never equals the backend integer id, so the content+role check
  // is necessary to prevent the socket from adding a second copy of every sent message).
  const existing = messages.value.find(
    m => m.id === String(msg.id) || (m.role === incomingRole && m.content === incomingContent)
  )
  if (existing) {
    // Upgrade the local UUID to the real backend id so future lookups succeed
    if (existing.id !== String(msg.id)) existing.id = String(msg.id)
    return
  }
  messages.value.push({
    id: String(msg.id),
    role: msg.isFromUser ? 'user' : 'assistant',
    content: msg.message ?? '',
    createdAt: msg.timestamp
      ? new Date(msg.timestamp).toISOString()
      : (msg.createdAt ?? new Date().toISOString()),
    esCalificacion: msg.hasCalification ?? false,
    nota: msg.calificationValue != null ? parseFloat(msg.calificationValue) : null,
    calificationAdded: msg.calificationAdded ?? false,
    excelUrl: msg.excelUrl ?? null,
  })
  scrollToBottom()
})

// ─── Chat persistence ─────────────────────────────────────────────────────────

async function loadHistoryFromBackend() {
  try {
    // Load by origin (per-account) first; fallback to legacy "app" origin, then session
    let data: any[] = []

    // 1. Try chatbot_llm origin
    try {
      const result = await chatAdapter.getMyMessagesByOrigin('chatbot_llm')
      if (Array.isArray(result)) data = result
    } catch (err) {
      console.warn('[ChatBotLLM] getMyMessagesByOrigin("chatbot_llm") failed:', err)
    }

    // 2. Fallback: try legacy "app" origin (old Android builds saved with this origin)
    if (data.length === 0) {
      try {
        const result = await chatAdapter.getMyMessagesByOrigin('app')
        if (Array.isArray(result)) data = result
      } catch (err) {
        console.warn('[ChatBotLLM] getMyMessagesByOrigin("app") failed:', err)
      }
    }

    // 3. Last resort: try by session id
    if (data.length === 0) {
      try {
        const result = await chatAdapter.getMessagesBySession(sessionId.value)
        if (Array.isArray(result)) data = result
      } catch (err) {
        console.warn('[ChatBotLLM] getMessagesBySession failed:', err)
      }
    }

    console.log(`[ChatBotLLM] loadHistory: ${data.length} mensajes cargados (userId=${tokenStorage.userId})`)
    if (data.length === 0) return

    messages.value = data.map((m: any) => ({
      id: String(m.id || '') || crypto.randomUUID(),
      role: m.role,
      content: m.content,
      createdAt: m.createdAt ?? new Date().toISOString(),
      esCalificacion: m.hasCalification ?? false,
      nota: m.calificationValue != null ? parseFloat(m.calificationValue) : null,
      calificationAdded: m.calificationAdded ?? false,
      excelUrl: m.excelUrl ?? null,
      submissionId: m.submissionId ?? null,
    }))
    scrollToBottom()
  } catch (e) {
    console.error('[ChatBotLLM] loadHistoryFromBackend error:', e)
  }
}

async function saveMessageToBackend(
  content: string,
  isFromUser: boolean,
  extra: Record<string, unknown> = {},
  msgId?: string
) {
  try {
    const numericId = msgId ? parseInt(msgId, 10) : null
    await chatAdapter.upsertMessage({
      ...(numericId && !isNaN(numericId) ? { id: numericId } : {}),
      content,
      role: isFromUser ? 'user' : 'assistant',
      sessionId: sessionId.value,
      origin: 'chatbot_llm',
      excelUrl: (extra.excel_url as string) ?? null,
      username: authStore.user?.username ?? null,
      hasCalification: extra.has_calification ?? false,
      calificationValue: extra.calification_value ?? null,
      calificationAdded: extra.calification_added ?? false,
      submissionId: extra.submission_id ?? null,
    } as any)
    console.log('[ChatBotLLM] Mensaje guardado en backend (origin=chatbot_llm)')
  } catch (e) {
    console.error('[ChatBotLLM] Error guardando mensaje en backend:', e)
  }
}

// ─── Scroll helpers ───────────────────────────────────────────────────────────

function scrollToBottom() {
  nextTick(() => {
    nextTick(() => {
      requestAnimationFrame(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTo({
            top: messagesContainer.value.scrollHeight,
            behavior: 'instant',
          })
        }
      })
    })
  })
}

function onContainerScroll() {
  if (!messagesContainer.value) return
  const el = messagesContainer.value
  showScrollBtn.value = el.scrollHeight - el.scrollTop - el.clientHeight > 120
}

// ─── Input handling & # detection ─────────────────────────────────────────────

function onInputChange() {
  autoResizeTextarea()
  detectHashtag()
  applyHashtagHighlight()
}

function autoResizeTextarea() {
  const el = inputRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

function detectHashtag() {
  const el = inputRef.value
  if (!el) return
  const text = inputText.value
  const cursor = el.selectionStart ?? text.length

  // Walk backwards from cursor to find # that triggers selector
  let i = cursor - 1
  while (i >= 0 && text[i] !== ' ' && text[i] !== '\n') {
    if (text[i] === '#') {
      currentHashStart.value = i
      const partial = text.slice(i + 1, cursor)
      openTaskOverlay(partial)
      return
    }
    i--
  }

  // No # found near cursor — close overlay if open
  if (showTaskOverlay.value) {
    closeTaskOverlay()
  }
}

function applyHashtagHighlight() {
  // Textarea doesn't support rich text; no-op – the overlay replaces the token on selection.
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && showTaskOverlay.value) {
    closeTaskOverlay()
    return
  }

  if (e.key === 'Escape' && isRecording.value) {
    stopRecording()
  }
}

function toggleRecording() {
  if (isRecording.value) {
    stopRecording()
    return
  }
  startRecording()
}

function startRecording() {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SpeechRecognition) {
    messages.value.push({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '⚠️ Tu navegador no soporta reconocimiento de voz. Intenta con Chrome o Edge.',
      createdAt: new Date().toISOString(),
    })
    scrollToBottom()
    return
  }

  recognition = new SpeechRecognition()
  recognition.lang = 'es-ES'
  recognition.interimResults = true
  recognition.maxAlternatives = 1
  recognition.continuous = true
  voiceBaseText = inputText.value.trimEnd()

  recognition.onresult = (event: any) => {
    const transcript = Array.from(event.results)
      .slice(event.resultIndex)
      .map((result: any) => result[0]?.transcript ?? '')
      .join(' ')
      .trim()

    inputText.value = voiceBaseText && transcript
      ? `${voiceBaseText} ${transcript}`
      : voiceBaseText || transcript

    nextTick(() => {
      autoResizeTextarea()
      inputRef.value?.focus()
    })
  }

  recognition.onerror = () => {
    isRecording.value = false
    recognition = null
  }

  recognition.onend = () => {
    isRecording.value = false
    recognition = null
    voiceBaseText = inputText.value.trimEnd()
  }

  recognition.start()
  isRecording.value = true
}

function stopRecording() {
  if (recognition) {
    recognition.stop()
  }
  isRecording.value = false
}

// ─── Task overlay ─────────────────────────────────────────────────────────────

async function openTaskOverlay(partial: string) {
  if (showTaskOverlay.value && isSelectingCourse.value) {
    // Already open at course level — just filter
    overlayQuery.value = partial
    return
  }
  showTaskOverlay.value = true
  isSelectingCourse.value = true
  overlayQuery.value = partial
  overlayItems.value = []
  await loadCourses()
}

function closeTaskOverlay() {
  showTaskOverlay.value = false
  overlayQuery.value = ''
}

function goBackToCourses() {
  isSelectingCourse.value = true
  overlayQuery.value = ''
  overlayItems.value = coursesCache.value.map(c => ({
    id: c.id,
    title: c.title,
    subtitle: c.description ?? undefined,
    courseId: c.id,
  }))
}

async function loadCourses() {
  overlayLoading.value = true
  try {
    const userId = tokenStorage.userId
    // Load courses created by user + manageable courses
    const [created, manageable] = await Promise.allSettled([
      courseAdapter.getCoursesByCreatorId(userId),
      courseAdapter.getManageableCourses(userId),
    ])

    const all: Course[] = []
    if (created.status === 'fulfilled') all.push(...created.value)
    if (manageable.status === 'fulfilled') all.push(...manageable.value)

    // Deduplicate by id
    const map = new Map<number, Course>()
    all.forEach(c => map.set(c.id, c))
    coursesCache.value = Array.from(map.values())

    overlayItems.value = coursesCache.value.map(c => ({
      id: c.id,
      title: c.title,
      subtitle: c.description ?? undefined,
      courseId: c.id,
    }))
  } catch (e) {
    console.error('Error loading courses:', e)
  } finally {
    overlayLoading.value = false
  }
}

async function loadSubmissionsForCourse(courseId: number) {
  isSelectingCourse.value = false
  overlayLoading.value = true
  overlayQuery.value = ''
  overlayItems.value = []

  try {
    const submissions = await submissionAdapter.getSubmissionByCourse(courseId)

    // Resolve task info in parallel (deduplicated by taskId)
    const taskIds: number[] = Array.from(new Set<number>(submissions.map((s: any) => s.task_id as number)))
    const taskMap = new Map<number, Task>()
    await Promise.all(
      taskIds.map(async (tid: number) => {
        try {
          const t = await taskAdapter.getTaskById(tid)
          taskMap.set(tid, t as Task)
        } catch { /* ignore */ }
      })
    )

    overlayItems.value = submissions.map(s => {
      const task = taskMap.get(s.task_id)
      return {
        id: s.id,
        title: task?.title ?? `Tarea #${s.task_id}`,
        subtitle: s.studentUsername ?? `Estudiante #${s.student_id}`,
        grade: s.grade ?? null,
        courseId,
        submission: s,
        task,
      }
    })
  } catch (e) {
    console.error('Error loading submissions:', e)
  } finally {
    overlayLoading.value = false
  }
}

function filterOverlay() {
  // computed property handles filtering
}

async function selectOverlayItem(item: OverlayItem) {
  if (isSelectingCourse.value) {
    // User selected a course — load its submissions
    await loadSubmissionsForCourse(item.id)
    return
  }

  // User selected a submission
  const sub = item.submission
  if (!sub) return

  const task = item.task
  const course = coursesCache.value.find(c => c.id === item.courseId)

  // Build context
  selectedTask.value = {
    submissionId: sub.id,
    taskId: sub.task_id,
    studentId: sub.student_id,
    fileUri: sub.file_uri,
    taskName: task?.title ?? `Tarea #${sub.task_id}`,
    taskDescription: task?.description ?? '',
    studentName: sub.studentUsername ?? `Estudiante #${sub.student_id}`,
    courseId: item.courseId ?? 0,
    courseName: course?.title ?? '',
  }

  // Replace the #... token in the input with the task name
  replaceHashToken(task?.title ?? `Tarea #${sub.task_id}`)
  closeTaskOverlay()
}

function replaceHashToken(replacement: string) {
  const el = inputRef.value
  if (!el) return
  const text = inputText.value
  const hashIdx = currentHashStart.value
  if (hashIdx === -1) return

  const cursor = el.selectionStart ?? text.length
  const before = text.slice(0, hashIdx)
  const after = text.slice(cursor)
  inputText.value = `${before}#${replacement} ${after}`
  currentHashStart.value = -1

  nextTick(() => {
    const newPos = before.length + replacement.length + 2
    el.setSelectionRange(newPos, newPos)
    el.focus()
    autoResizeTextarea()
  })
}

function clearContext() {
  selectedTask.value = null
}

// ─── Image attachment ─────────────────────────────────────────────────────────

function onImageSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 7 * 1024 * 1024) {
    alert('La imagen es demasiado grande. Máximo 7 MB.')
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    pendingImage.value = reader.result as string
    pendingImageName.value = file.name
  }
  reader.readAsDataURL(file)
}

function clearPendingImage() {
  pendingImage.value = null
  pendingImageName.value = ''
  if (imageInputRef.value) imageInputRef.value.value = ''
}

// ─── Course plan helpers ─────────────────────────────────────────────────────

/** Detects if the message is a course creation request. */
function detectCourseIntent(text: string): boolean {
  const n = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return [
    /\b(crea(me)?|cr[eé]ame|haz(me)?|dis[eé][nñ]a(me)?|planifica(me)?|genera(me)?|elabora(me)?|prepara(me)?|construye(me)?|desarrolla(me)?|arma(me)?|monta(me)?)\b.{0,50}\bcurso\b/,
    /\b(quiero|necesito|deseo|quisiera|podrias|puedes|me\s+gustar[ií]a)\b.{0,40}\b(un\s+)?curso\b/,
    /\b(un\s+)?curso\s+(de|sobre|para|acerca\s+de)\b/,
    /\bcurs[aá](me)?\b/,
  ].some(p => p.test(n))
}

/** Aggressive JSON repair for broken LLM output (handles stray props, double braces, imbalanced brackets). */
function repairJson(str: string): string {
  let s = str
  for (let round = 0; round < 10; round++) {
    const prev = s
    // Remove trailing commas before } or ]
    s = s.replace(/,([\s\n]*[}\]])/g, '$1')
    // Remove stray "key": value pairs after } and before ] or }
    s = s.replace(/}(\s*)"[^"]*"\s*:\s*(?:"(?:[^"\\]|\\.)*"|[^,[\]{}"']+?),?(\s*[}\]])/g, '}$2')
    // Remove stray "key": value pairs at the start of arrays (before first {)
    s = s.replace(/\[(\s*)"[^"]*"\s*:\s*(?:"(?:[^"\\]|\\.)*"|[^,[\]{}"']+?),?(\s*\{)/g, '[$1$2')
    // Merge orphaned empty objects into the following property: {}  "key":  →  {"key":
    s = s.replace(/\{\s*\}(\s*)"([^"]+)"(\s*):/g, '{"$2"$3:')
    // Collapse double open braces {{ → {
    s = s.replace(/\{\s*\{/g, '{')
    // Add missing commas between } and {
    s = s.replace(/}(\s*)\{/g, '},$1{')
    // Remove isolated empty objects in arrays
    s = s.replace(/,(\s*)\{\s*\}(\s*),/g, ',')
    s = s.replace(/\[(\s*)\{\s*\}(\s*),/g, '[$1')
    s = s.replace(/,(\s*)\{\s*\}(\s*)\]/g, '$1]')
    if (s === prev) break
  }
  // Balance unclosed braces/brackets (string-aware)
  let curly = 0, square = 0, inStr = false, esc = false
  for (const ch of s) {
    if (esc) { esc = false; continue }
    if (ch === '\\' && inStr) { esc = true; continue }
    if (ch === '"') { inStr = !inStr; continue }
    if (inStr) continue
    if (ch === '{') curly++
    else if (ch === '}') { if (curly > 0) curly-- }
    else if (ch === '[') square++
    else if (ch === ']') { if (square > 0) square-- }
  }
  return s + '}'.repeat(Math.max(0, curly)) + ']'.repeat(Math.max(0, square))
}

/**
 * Reconstructs a plan from hopelessly broken JSON that `repairJson` couldn't fix.
 * Fallback LLMs emit the right `"key": value` tokens but with the object/array nesting
 * jumbled. The tokens stay intact and ordered, so we rebuild the subject → topic → task
 * hierarchy positionally — recovering topics and tasks, not just the title + subject names.
 */
function tryExtractPlanPartial(raw: string): CoursePlan | null {
  const titleM = raw.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/)
  if (!titleM) return null
  const firstField = (key: string) => {
    const mm = raw.match(new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`))
    return mm ? mm[1] : ''
  }
  const weekM = raw.match(/"durationWeeks"\s*:\s*(\d+)/)

  type Tok = { type: 'name' | 'title' | 'description' | 'contentDescription' | 'dueWeek'; value: string | number }
  const tokens: Tok[] = []
  const re = /"(name|title|description|contentDescription|dueWeek)"\s*:\s*(?:"((?:[^"\\]|\\.)*)"|(-?\d+))/g
  let m: RegExpExecArray | null
  while ((m = re.exec(raw)) !== null) {
    tokens.push({
      type: m[1] as Tok['type'],
      value: m[2] !== undefined ? m[2] : Number(m[3]),
    })
  }

  const firstNameIdx = tokens.findIndex(t => t.type === 'name')
  if (firstNameIdx === -1) return null
  const body = tokens.slice(firstNameIdx)

  const isTaskTitle = (i: number) => {
    for (let j = i + 1; j < body.length; j++) {
      const t = body[j]
      if (t.type === 'title' || t.type === 'name') return false
      if (t.type === 'dueWeek') return true
    }
    return false
  }

  interface RTask { title: string; description: string; dueWeek: number | null; contentDescription: string }
  interface RTopic { title: string; description: string; contentDescription: string; tasks: RTask[] }
  interface RSubject { name: string; description: string; topics: RTopic[] }
  const subjects: RSubject[] = []
  let curSubject: RSubject | null = null
  let curTopic: RTopic | null = null
  let curTask: RTask | null = null
  let lastOpened: { description: string } | null = null

  const ensureSubject = (): RSubject => {
    if (!curSubject) { curSubject = { name: '', description: '', topics: [] }; subjects.push(curSubject) }
    return curSubject
  }
  const ensureTopic = (): RTopic => {
    ensureSubject()
    if (!curTopic) { curTopic = { title: '', description: '', contentDescription: '', tasks: [] }; curSubject!.topics.push(curTopic) }
    return curTopic
  }

  for (let i = 0; i < body.length; i++) {
    const tok = body[i]
    if (tok.type === 'name') {
      curSubject = { name: String(tok.value), description: '', topics: [] }
      subjects.push(curSubject)
      curTopic = null; curTask = null; lastOpened = curSubject
    } else if (tok.type === 'title') {
      if (isTaskTitle(i)) {
        ensureTopic()
        curTask = { title: String(tok.value), description: '', dueWeek: null, contentDescription: '' }
        curTopic!.tasks.push(curTask)
        lastOpened = curTask
      } else {
        ensureSubject()
        curTopic = { title: String(tok.value), description: '', contentDescription: '', tasks: [] }
        curSubject!.topics.push(curTopic)
        curTask = null; lastOpened = curTopic
      }
    } else if (tok.type === 'description') {
      if (lastOpened && !lastOpened.description) lastOpened.description = String(tok.value)
    } else if (tok.type === 'contentDescription') {
      const target = curTask || curTopic
      if (target && !target.contentDescription) target.contentDescription = String(tok.value)
    } else if (tok.type === 'dueWeek') {
      if (curTask && curTask.dueWeek == null) curTask.dueWeek = Number(tok.value)
    }
  }

  const cleanSubjects: CoursePlan['subjects'] = subjects
    .filter(s => s.name || s.topics.length)
    .map((s, si) => ({
      name: s.name || `Módulo ${si + 1}`,
      description: s.description,
      topics: s.topics
        .filter(t => t.title || t.tasks.length)
        .map((t, ti) => ({
          title: t.title || `Tema ${ti + 1}`,
          description: t.description,
          contentDescription: t.contentDescription || undefined,
          tasks: t.tasks.map(k => ({
            title: k.title,
            description: k.description,
            dueWeek: k.dueWeek,
            contentDescription: k.contentDescription || undefined,
          })),
        })),
    }))
  if (!cleanSubjects.length) return null

  return {
    title: titleM[1],
    description: firstField('description'),
    category: firstField('category'),
    level: firstField('level'),
    durationWeeks: weekM ? Number(weekM[1]) : undefined,
    subjects: cleanSubjects,
  }
}

/** Extracts the first valid course plan JSON from a raw LLM response. */
function extractPlan(raw: string): CoursePlan | null {
  if (!raw) return null
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced ? fenced[1] : raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)
  for (const attempt of [candidate, repairJson(candidate)]) {
    try {
      const parsed = JSON.parse(attempt)
      const obj = (parsed?.tool === 'create_course_structure' && parsed?.arguments?.plan)
        ? parsed.arguments.plan
        : parsed
      if (obj && typeof obj.title === 'string' && Array.isArray(obj.subjects)) {
        return {
          title: obj.title,
          description: obj.description ?? '',
          category: obj.category ?? '',
          level: obj.level ?? '',
          durationWeeks: typeof obj.durationWeeks === 'number' ? obj.durationWeeks : undefined,
          subjects: (obj.subjects ?? []).map((s: Record<string, unknown>) => ({
            name: String(s.name ?? ''),
            description: String(s.description ?? ''),
            topics: (Array.isArray(s.topics) ? s.topics : []).map((t: Record<string, unknown>) => ({
              title: String(t.title ?? t.name ?? ''),
              description: String(t.description ?? ''),
              contentDescription: t.contentDescription ? String(t.contentDescription) : undefined,
              tasks: (Array.isArray(t.tasks) ? t.tasks : []).map((k: Record<string, unknown>) => ({
                title: String(k.title ?? ''),
                description: String(k.description ?? ''),
                dueWeek: typeof k.dueWeek === 'number' ? k.dueWeek : null,
                contentDescription: k.contentDescription ? String(k.contentDescription) : undefined,
              })),
            })),
          })),
        }
      }
    } catch { /* try next attempt */ }
  }
  // Last resort: partial extraction so the card always appears with at least title + subjects
  return tryExtractPlanPartial(raw)
}

function buildPlannerPrompt(userText: string): string {
  const current = coursePlan.value
    ? `\n\nPLAN ACTUAL (modifícalo según la petición, conserva lo que no se mencione):\n${JSON.stringify(coursePlan.value)}`
    : ''
  return `Petición: "${userText}"${current}`
}

async function requestCoursePlan(text: string) {
  createdCourseId.value = null
  courseCreateError.value = ''
  const isUpdate = !!coursePlan.value
  isTyping.value = true
  isSending.value = true
  try {
    const prompt = coursePlan.value ? buildPlannerPrompt(text) : text
    const localDraft = mergeCourseDraftFromUserText(text, courseDraft.value)
    courseDraft.value = localDraft
    persistCourseDraft()
    const data = await api.postSlow<{
      respuesta_texto?: string
      response?: string
      courseDraft?: CourseCreationDraft
      missingCourseFields?: CourseDraftField[]
      nextCourseQuestion?: string
      isCoursePlan?: boolean
    }>(
      '/llm/process',
      {
        prompt,
        sessionId: sessionId.value,
        userId: tokenStorage.userId,
        username: tokenStorage.username,
        courseMode: true,
        fastMode: true,
        courseDraft: localDraft,
        conversationHistory: buildCourseConversationHistory(),
      },
      300_000,
    )
    if (data.courseDraft) {
      courseDraft.value = mergeCourseDraftValues(localDraft, data.courseDraft)
      persistCourseDraft()
    }
    const rawAnswer = data.respuesta_texto ?? data.response ?? ''
    const parsed = extractPlan(rawAnswer)
    if (parsed) {
      coursePlan.value = parsed
      clearPersistedCourseDraft()
      planVersion.value += 1
      // Remove any existing plan-card slot so the updated card always appears at the bottom
      messages.value = messages.value.filter(m => !m.isPlanCard)
      const msg: ChatMsg = {
        id: crypto.randomUUID(),
        content: isUpdate
          ? 'Plan actualizado con tus cambios. Sigue ajustando o confirma para crear el curso.'
          : 'Aquí está tu plan de curso. Puedes pedirme cualquier ajuste, o confirmarlo para crearlo de inmediato.',
        role: 'assistant',
        createdAt: new Date().toISOString(),
      }
      messages.value.push(msg)
      // Push an inline plan-card marker so the card renders in the natural message flow
      messages.value.push({
        id: `plan-card-v${planVersion.value}`,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        isPlanCard: true,
      })
      // Persist so the card survives a page reload (only the text message is saved to DB)
      persistPlan()
      saveMessageToBackend(msg.content, false, {})
    } else {
      const looksLikeJson = /\{[\s\S]*"(title|tool|subjects)"[\s\S]*\}/.test(rawAnswer)
      const assistantContent = data.nextCourseQuestion || (looksLikeJson || !rawAnswer
        ? 'No pude generar el plan correctamente. Intenta describir el curso con mas detalle (tema, objetivo, duracion y nivel).'
        : rawAnswer)
      const msg: ChatMsg = {
        id: crypto.randomUUID(),
        content: assistantContent,
        role: 'assistant',
        createdAt: new Date().toISOString(),
      }
      messages.value.push(msg)
      saveMessageToBackend(msg.content, false, {})
    }
  } catch (e) {
    if (e instanceof HttpError && e.statusCode === 401) {
      messages.value.push({
        id: crypto.randomUUID(),
        content: '⚠️ Tu sesión ha expirado. Redirigiendo al inicio de sesión...',
        role: 'assistant',
        createdAt: new Date().toISOString(),
      })
      setTimeout(() => authStore.logout(), 2000)
      return
    }
    const timedOut = e instanceof DOMException && e.name === 'AbortError'
    messages.value.push({
      id: crypto.randomUUID(),
      content: timedOut
        ? 'La generación del plan está tardando. Intenta de nuevo.'
        : 'Error al generar el plan del curso.',
      role: 'assistant',
      createdAt: new Date().toISOString(),
    })
  } finally {
    isTyping.value = false
    isSending.value = false
    scrollToBottom()
  }
}

/** Strips subjects/topics/tasks with blank required fields before submitting to avoid VALIDATION_ERROR. */
function sanitizePlanForSubmit(plan: CoursePlan): CoursePlan | null {
  const subjects = (plan.subjects ?? [])
    .map(s => ({
      ...s,
      name: (s.name ?? '').trim(),
      topics: (s.topics ?? [])
        .map(t => ({
          ...t,
          title: (t.title ?? '').trim(),
          tasks: (t.tasks ?? []).filter(k => (k.title ?? '').trim().length > 0),
        }))
        .filter(t => t.title.length > 0),
    }))
    .filter(s => s.name.length > 0)
  if (!subjects.length) return null
  return { ...plan, subjects }
}

async function createCourseFromPlan() {
  if (!coursePlan.value || isCreatingCourse.value) return
  isCreatingCourse.value = true
  courseCreateError.value = ''
  try {
    const sanitized = sanitizePlanForSubmit(coursePlan.value)
    if (!sanitized) {
      courseCreateError.value = 'El plan no tiene materias válidas. Pide ajustes por chat.'
      isCreatingCourse.value = false
      return
    }
    const data = await api.postSlow<{
      courseId: number
      topicsCreated: number
      tasksCreated: number
      thumbnailsInProgress?: boolean
      docsInProgress?: boolean
    }>(
      '/llm/confirm-course',
      {
        plan: sanitized,
        userId: tokenStorage.userId || undefined,
        username: tokenStorage.username || undefined,
        generateThumbnails: true,
        generateDocuments: true,
      },
      90_000,
    )
    createdCourseId.value = data.courseId
    const resourceStatus = [
      data.thumbnailsInProgress ? 'miniaturas del curso y materias' : '',
      data.docsInProgress ? 'documentos Word/PDF para temas y tareas' : '',
    ].filter(Boolean).join(' y ')
    const msg: ChatMsg = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: resourceStatus
        ? `Curso creado. Estoy generando en segundo plano ${resourceStatus} y guardando los archivos en Cloudflare R2.`
        : 'Curso creado. No se pudo iniciar la generacion automatica de miniaturas o documentos; revisa la configuracion de R2/OpenRouter.',
      createdAt: new Date().toISOString(),
    }
    messages.value.push(msg)
    saveMessageToBackend(msg.content, false, {})
    // Course committed to the DB — drop the persisted draft so it won't reappear on reload
    clearPersistedPlan()
    clearPersistedCourseDraft()
    scrollToBottom()
  } catch (e) {
    courseCreateError.value = e instanceof Error ? e.message : 'Error al crear el curso'
  } finally {
    isCreatingCourse.value = false
  }
}

function rejectCoursePlan() {
  coursePlan.value = null
  createdCourseId.value = null
  courseCreateError.value = ''
  isCourseMode.value = false
  clearPersistedPlan()
  clearPersistedCourseDraft()
  const msg: ChatMsg = {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: 'Plan cancelado. Puedes pedirme otro curso cuando quieras.',
    createdAt: new Date().toISOString(),
  }
  messages.value.push(msg)
  saveMessageToBackend(msg.content, false, {})
}

function viewCreatedCourse(id: number) {
  router.push({ path: `/subjects/${id}` })
}

// ─── Send message ─────────────────────────────────────────────────────────────

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isTyping.value || isSending.value) return

  // ── Course creation intercept ──────────────────────────────────────────────
  // When the user explicitly creates a NEW course (course mode was off), reset
  // any existing plan so isUpdate = false and the message says "Aquí está tu plan".
  if (!isCourseMode.value && detectCourseIntent(text)) {
    isCourseMode.value = true
    coursePlan.value = null
    clearPersistedCourseDraft()
    planVersion.value = 0
    createdCourseId.value = null
    courseCreateError.value = ''
  }
  if (isCourseMode.value) {
    isSending.value = true
    const userMsg: ChatMsg = {
      id: crypto.randomUUID(),
      content: text,
      role: 'user',
      createdAt: new Date().toISOString(),
    }
    messages.value.push(userMsg)
    await saveMessageToBackend(userMsg.content, true, {})
    inputText.value = ''
    autoResizeTextarea()
    scrollToBottom()
    await requestCoursePlan(text)
    return
  }

  isSending.value = true

  if (isRecording.value) {
    stopRecording()
  }

  const ctx = selectedTask.value
  const userMsg: ChatMsg = {
    id: crypto.randomUUID(),
    content: text,
    role: 'user',
    createdAt: new Date().toISOString(),
  }
  messages.value.push(userMsg)
  // Await the user message save to prevent data loss on immediate reload
  await saveMessageToBackend(userMsg.content, true, {
    submission_id: ctx?.submissionId ?? null,
  })
  inputText.value = ''
  autoResizeTextarea()
  scrollToBottom()

  isTyping.value = true
  try {

    // Build taskDescription block (mirrors Android)
    let taskDescription: string | undefined
    if (ctx) {
      taskDescription =
        `📋 TAREA: ${ctx.taskName}\n` +
        `📝 DESCRIPCIÓN DEL PROFESOR:\n${ctx.taskDescription}\n` +
        `👤 ESTUDIANTE: ${ctx.studentName}`
    }

    const progressCtx = selectedProgressContext.value

    const payload: Record<string, unknown> = {
      prompt: text,
      sessionId: sessionId.value,
      userId: tokenStorage.userId,
      username: tokenStorage.username,
      ...(ctx && {
        taskDescription,
        submissionId: ctx.submissionId,
        taskId: ctx.taskId,
        studentId: ctx.studentId,
        fileUri: ctx.fileUri,
        courseId: ctx.courseId,
      }),
      // Inject pre-fetched student progress as context when no grading task is active
      ...(!ctx && progressCtx && {
        taskDescription: progressCtx.summary,
        courseId: progressCtx.courseId,
        forceMCPTools: authStore.isAdminOrDocente,
      }),
      // Enable MCP tools (DB queries) only for teachers and admins
      ...(!ctx && !progressCtx && authStore.isAdminOrDocente && { forceMCPTools: true }),
      // Attach image if user selected one
      ...(pendingImage.value && { imageBase64: pendingImage.value }),
    }

    // Clear image after building payload
    clearPendingImage()

    const data = await api.postSlow<{
      respuesta_texto?: string
      response?: string
      esCalificacion?: boolean
      nota?: number | null
    }>('/llm/process', payload, 300_000)

    // Safety net: if LLM leaks a course plan JSON (e.g. tool-call format), intercept it
    // and show the CoursePlanCard confirm/reject UI instead of raw JSON.
    const rawAnswer = data.respuesta_texto ?? data.response ?? ''
    const autoPlan = !ctx ? extractPlan(rawAnswer) : null
    if (autoPlan) {
      isCourseMode.value = true
      coursePlan.value = autoPlan
      planVersion.value += 1
      // Drop any stale plan-card marker so the updated card stays at the bottom
      messages.value = messages.value.filter(m => !m.isPlanCard)
      const planMsg: ChatMsg = {
        id: crypto.randomUUID(),
        content: 'Aquí está tu plan de curso. Puedes pedirme cualquier ajuste, o confirmarlo para crearlo de inmediato.',
        role: 'assistant',
        createdAt: new Date().toISOString(),
      }
      messages.value.push(planMsg)
      // Inline plan-card marker so the card renders in the natural message flow
      messages.value.push({
        id: `plan-card-v${planVersion.value}`,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        isPlanCard: true,
      })
      // Persist so the card survives a page reload (only the text message is saved to DB)
      persistPlan()
      saveMessageToBackend(planMsg.content, false, {})
    } else {
      const botMsg: ChatMsg = {
        id: crypto.randomUUID(),
        content: rawAnswer || 'Sin respuesta',
        role: 'assistant',
        createdAt: new Date().toISOString(),
        esCalificacion: data.esCalificacion === true,
        nota: data.nota ?? null,
        calificationAdded: false,
        excelUrl: (data as any).excelUrl ?? null,
        submissionId: ctx?.submissionId ?? null,
        feedback: (data as any).feedback ?? null,
      }
      messages.value.push(botMsg)
      saveMessageToBackend(botMsg.content, false, {
        has_calification: botMsg.esCalificacion,
        calification_value: botMsg.nota != null ? String(botMsg.nota) : null,
        excel_url: botMsg.excelUrl ?? null,
        submission_id: ctx?.submissionId ?? null,
      })
    }
  } catch (e) {
    if (e instanceof HttpError && e.statusCode === 401) {
      const sessionMsg: ChatMsg = {
        id: crypto.randomUUID(),
        content: '⚠️ Tu sesión ha expirado. Redirigiendo al inicio de sesión...',
        role: 'assistant',
        createdAt: new Date().toISOString(),
      }
      messages.value.push(sessionMsg)
      // Give the user a moment to read the message before redirecting
      setTimeout(() => authStore.logout(), 2000)
      return
    }

    const errorMessage = e instanceof HttpError
      ? `❌ ${e.message}`
      : e instanceof DOMException && e.name === 'AbortError'
        ? '❌ La solicitud tardó demasiado. Intenta de nuevo.'
        : e instanceof Error
          ? `❌ ${e.message}`
          : '❌ Error al procesar el mensaje. Por favor intenta de nuevo.'

    const errMsg: ChatMsg = {
      id: crypto.randomUUID(),
      content: errorMessage,
      role: 'assistant',
      createdAt: new Date().toISOString(),
    }
    messages.value.push(errMsg)
  } finally {
    isTyping.value = false
    isSending.value = false
    scrollToBottom()
  }
}

// ─── Grading ──────────────────────────────────────────────────────────────────

async function addGrade(msg: ChatMsg) {
  if (msg.calificationAdded) return

  // Resolve submissionId: stored in message → active context (mirrors Android fallback chain)
  const submissionId = msg.submissionId ?? selectedTask.value?.submissionId ?? null
  if (submissionId == null) {
    console.warn('addGrade: no submissionId available')
    return
  }

  const grade = msg.nota ?? extractGradeFromText(msg.content)
  if (grade == null) return

  // Use dedicated feedback from LLM response; fall back to extracting from message content
  const feedback = msg.feedback ?? extractFeedback(msg.content)
  const ctx = selectedTask.value

  // Optimistic update — hide the button immediately so the user gets instant feedback
  msg.calificationAdded = true

  try {
    await submissionAdapter.gradeSubmission(submissionId, grade, feedback)

    // Persist the calificationAdded flag; pass msg.id so the backend does an UPDATE
    // instead of INSERT, avoiding the idempotency 409 conflict.
    saveMessageToBackend(msg.content, false, {
      has_calification: true,
      calification_value: String(grade),
      calification_added: true,
      submission_id: submissionId,
    }, msg.id)

    // Track for graded overlay
    gradedTasks.value.unshift({
      submissionId,
      taskName: ctx?.taskName ?? `Entrega #${submissionId}`,
      studentName: ctx?.studentName ?? 'Estudiante',
      grade,
      feedback,
    })

    // Confirmation message
    const confirmContent = ctx
      ? `✅ Calificación **${grade}/10** guardada para **${ctx.studentName}** en la tarea **${ctx.taskName}**.`
      : `✅ Calificación **${grade}/10** guardada correctamente (entrega #${submissionId}).`
    messages.value.push({
      id: crypto.randomUUID(),
      content: confirmContent,
      role: 'assistant',
      createdAt: new Date().toISOString(),
      // Mark as already-handled so the grading button doesn't reappear on this
      // confirmation message (its text contains "X/10" which would otherwise
      // trigger messageHasGrade()).
      calificationAdded: true,
    })
    saveMessageToBackend(confirmContent, false, {
      has_calification: true,
      calification_value: String(grade),
      calification_added: true,
      submission_id: submissionId,
    })
    scrollToBottom()
  } catch (e) {
    // Revert the optimistic update and inform the user
    msg.calificationAdded = false
    console.error('Error grading submission:', e)
    messages.value.push({
      id: crypto.randomUUID(),
      content: '❌ No se pudo guardar la calificación. Por favor intenta de nuevo.',
      role: 'assistant',
      createdAt: new Date().toISOString(),
      calificationAdded: true,
    })
    scrollToBottom()
  }
}

function rejectGrade(msg: ChatMsg) {
  msg.calificationAdded = true
  // Persist so the rejection survives a reload; pass msg.id for UPDATE instead of INSERT
  saveMessageToBackend(msg.content, false, {
    has_calification: true,
    calification_value: msg.nota != null ? String(msg.nota) : null,
    calification_added: true,
    submission_id: msg.submissionId ?? selectedTask.value?.submissionId ?? null,
  }, msg.id)
}

function messageHasGrade(msg: ChatMsg): boolean {
  return msg.esCalificacion === true ||
    msg.nota != null ||
    extractGradeFromText(msg.content) != null
}

function extractGradeFromText(text: string): number | null {
  // Patterns: "calificación: 8", "8/10", "nota: 8.5"
  const patterns = [
    /calificaci[oó]n[:\s]+(\d+(?:\.\d+)?)/i,
    /nota[:\s]+(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*\/\s*10/i,
    /puntaje[:\s]+(\d+(?:\.\d+)?)/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) {
      const v = parseFloat(m[1])
      // Normalize to 0-10 scale
      return v > 10 ? parseFloat((v / 10).toFixed(1)) : v
    }
  }
  return null
}

function extractFeedback(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/^[#\-]+\s*/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 2000)
}

// ─── Student progress ────────────────────────────────────────────────────────

async function openStudentProgressOverlay() {
  showStudentProgressOverlay.value = true
  if (studentProgressData.value.length) return // use cache
  studentProgressLoading.value = true
  try {
    const data = await api.get<StudentProgressData[]>('/progress/teacher/students')
    studentProgressData.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Error loading student progress:', e)
    studentProgressData.value = []
  } finally {
    studentProgressLoading.value = false
  }
}

function closeStudentProgressOverlay() {
  showStudentProgressOverlay.value = false
}

function avgGrade(course: StudentProgressData): string {
  if (!course.students.length) return '0.0'
  const sum = course.students.reduce((acc, s) => acc + (s.averageGrade || 0), 0)
  return (sum / course.students.length).toFixed(1)
}

function selectProgressCourse(course: StudentProgressData) {
  const total = course.students.length
  const passed = course.students.filter(s => s.status === 'Ganado').length
  const avg = avgGrade(course)

  const lines = [
    `📊 RESUMEN DE PROGRESO — ${course.courseName}`,
    `Total estudiantes: ${total} | Aprobados: ${passed} | Pendientes: ${total - passed}`,
    `Promedio general: ${avg}/10`,
    ``,
    `DETALLE POR ESTUDIANTE:`,
    ...course.students.map(s =>
      `• ${s.username}: ${s.progressPercentage}% completado, nota ${s.averageGrade}/10 (${s.status})`
    ),
  ]

  selectedProgressContext.value = {
    courseId: course.courseId,
    courseName: course.courseName,
    summary: lines.join('\n'),
  }
  closeStudentProgressOverlay()
}

function clearProgressContext() {
  selectedProgressContext.value = null
}

async function exportCourseProgressExcel(course: StudentProgressData) {
  if (exportingExcel.value) return
  exportingExcel.value = true
  closeStudentProgressOverlay()
  try {
    const query = `Progreso de estudiantes en el curso ${course.courseName}: ` +
      course.students.map(s =>
        `${s.username}: ${s.progressPercentage}% completado, nota ${s.averageGrade}/10, estado ${s.status}`
      ).join('; ')

    const data = await api.post<{ url: string; rows: number }>(  '/excel/generate-excel', {
      query,
      userId: tokenStorage.userId,
    })

    const excelMsg: ChatMsg = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `📊 Excel de progreso generado para **${course.courseName}** (${data.rows} filas).`,
      createdAt: new Date().toISOString(),
      excelUrl: data.url,
    }
    messages.value.push(excelMsg)
    saveMessageToBackend(excelMsg.content, false)
    scrollToBottom()
  } catch (e) {
    console.error('Error exportando Excel:', e)
    messages.value.push({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '❌ No se pudo generar el Excel. Intenta de nuevo.',
      createdAt: new Date().toISOString(),
    })
    scrollToBottom()
  } finally {
    exportingExcel.value = false
  }
}

async function exportAllProgressExcel() {
  if (exportingExcel.value || !studentProgressData.value.length) return
  exportingExcel.value = true
  closeStudentProgressOverlay()
  try {
    const rows = studentProgressData.value.flatMap(course =>
      course.students.map(s =>
        `(${course.courseName}) ${s.username}: ${s.progressPercentage}% completado, nota ${s.averageGrade}/10, estado ${s.status}`
      )
    )
    const query = `Reporte completo de progreso de estudiantes en todos los cursos:\n${rows.join('\n')}`

    const data = await api.post<{ url: string; rows: number }>('/excel/generate-excel', {
      query,
      userId: tokenStorage.userId,
    })

    const excelMsg: ChatMsg = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `📊 Excel de progreso general generado (${data.rows} filas, ${studentProgressData.value.length} cursos).`,
      createdAt: new Date().toISOString(),
      excelUrl: data.url,
    }
    messages.value.push(excelMsg)
    saveMessageToBackend(excelMsg.content, false)
    scrollToBottom()
  } catch (e) {
    console.error('Error exportando Excel:', e)
    messages.value.push({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '❌ No se pudo generar el Excel. Intenta de nuevo.',
      createdAt: new Date().toISOString(),
    })
    scrollToBottom()
  } finally {
    exportingExcel.value = false
  }
}

function insertSuggestion(text: string) {
  inputText.value = text
  nextTick(() => inputRef.value?.focus())
}

// ─── Graded overlay ────────────────────────────────────────────────────────────

function loadGradedContext(g: GradedEntry) {
  showGradedOverlay.value = false
  // Pre-fill message with context about the already-graded submission
  inputText.value = `Retroalimentación adicional sobre la calificación ${g.grade}/10 de ${g.studentName} en ${g.taskName}: `
  nextTick(() => {
    inputRef.value?.focus()
    autoResizeTextarea()
  })
}

// ─── Utilities ────────────────────────────────────────────────────────────────

// Clears the visible conversation only — DB records are kept permanently
function clearChat() {
  messages.value = []
  selectedTask.value = null
  coursePlan.value = null
  planVersion.value = 0
  isCourseMode.value = false
  createdCourseId.value = null
  courseCreateError.value = ''
  clearPersistedPlan()
  clearPersistedCourseDraft()
}

// ─── Message actions ───────────────────────────────────────────────────────

function copyMessage(msg: ChatMsg) {
  navigator.clipboard.writeText(msg.content).then(() => {
    copiedMsgId.value = msg.id
    setTimeout(() => { copiedMsgId.value = null }, 2000)
  }).catch(() => {})
}

function likeMessage(msg: ChatMsg) {
  likedMsgId.value = likedMsgId.value === msg.id ? null : msg.id
  dislikedMsgId.value = null
}

function dislikeMessage(msg: ChatMsg) {
  dislikedMsgId.value = dislikedMsgId.value === msg.id ? null : msg.id
  likedMsgId.value = null
}

function shareMessage(msg: ChatMsg) {
  if (navigator.share) {
    navigator.share({ text: msg.content }).catch(() => {})
  } else {
    navigator.clipboard.writeText(msg.content).catch(() => {})
  }
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

function renderMarkdown(text: string): string {
  // First, extract and convert markdown tables before escaping HTML
  const lines = text.split('\n')
  const processedLines: string[] = []
  let i = 0

  while (i < lines.length) {
    // Detect table: a line with pipes, followed by a separator (|---|)
    if (
      i + 1 < lines.length &&
      lines[i].includes('|') &&
      /^\s*\|?\s*[-:]+[-|:\s]*$/.test(lines[i + 1])
    ) {
      // Parse header
      const headerCells = lines[i]
        .split('|')
        .map(c => c.trim())
        .filter(c => c.length > 0)

      // Skip separator
      let j = i + 2
      const bodyRows: string[][] = []
      while (j < lines.length && lines[j].includes('|') && !/^\s*$/.test(lines[j])) {
        const cells = lines[j]
          .split('|')
          .map(c => c.trim())
          .filter(c => c.length > 0)
        if (cells.length > 0) bodyRows.push(cells)
        j++
      }

      // Build HTML table
      let table = '<div class="table-wrapper"><table class="md-table">'
      table += '<thead><tr>'
      for (const h of headerCells) {
        table += `<th>${h.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</th>`
      }
      table += '</tr></thead><tbody>'
      for (const row of bodyRows) {
        table += '<tr>'
        for (let k = 0; k < headerCells.length; k++) {
          const cell = (row[k] ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          table += `<td>${cell}</td>`
        }
        table += '</tr>'
      }
      table += '</tbody></table></div>'
      processedLines.push(table)
      i = j
    } else {
      // Normal line — escape and apply inline markdown
      const line = lines[i]
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/^(#{1,3})\s+(.+)$/, (_, _h, t) => `<strong>${t}</strong>`)
      processedLines.push(line)
      i++
    }
  }

  return processedLines.join('<br />')
}
</script>

<style scoped>
*,
*::before,
*::after { box-sizing: border-box; }

/* ─── Course mode banner ─────────────────────────── */
.course-mode-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  background: rgba(191, 90, 242, 0.07);
  border-top: 1px solid rgba(191, 90, 242, 0.14);
  flex-shrink: 0;
}
.cm-icon {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: rgba(191, 90, 242, 0.15);
  color: #BF5AF2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cm-text {
  flex: 1;
  font-size: 11.5px;
  color: #C7A0E8;
  line-height: 1.3;
  letter-spacing: 0.1px;
}
.cm-close {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8E6AB2;
  background: rgba(191, 90, 242, 0.1);
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}
.cm-close:hover { background: rgba(191, 90, 242, 0.2); color: #BF5AF2; }

/* ─── Root ──────────────────────────────────────── */
.chat-root {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: #0B141A;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif;
}

/* ─── Header ────────────────────────────────────── */
.chat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #1F2C34;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.hdr-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: rgba(255,255,255,0.65);
  flex-shrink: 0;
  transition: background 0.15s;
}
.hdr-btn:hover { background: rgba(255,255,255,0.07); }

.hdr-avatar {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #2A3942;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.hdr-status-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #25D366;
  border: 2px solid #1F2C34;
}

.hdr-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.hdr-name {
  font-size: 15px;
  font-weight: 600;
  color: #E9EDEF;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hdr-sub {
  font-size: 12px;
  color: #8696A0;
  margin: 0;
}

.hdr-actions {
  display: flex;
  gap: 2px;
}

/* ─── Context bar ───────────────────────────────── */
.tenant-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  background: #0d1117;
  border-bottom: 1px solid rgba(37,211,102,0.15);
  flex-shrink: 0;
}
.tenant-bar-label {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  white-space: nowrap;
}
.tenant-select {
  flex: 1;
  background: #1a2733;
  color: #e9edef;
  border: 1px solid rgba(37,211,102,0.25);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 13px;
  cursor: pointer;
  outline: none;
}
.tenant-select:focus {
  border-color: #25D366;
}

.ctx-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: #182229;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  gap: 10px;
  flex-shrink: 0;
}
.ctx-bar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.ctx-bar-accent {
  width: 3px;
  height: 32px;
  border-radius: 2px;
  background: #25D366;
  flex-shrink: 0;
}
.ctx-task {
  font-size: 13px;
  font-weight: 600;
  color: #25D366;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ctx-student {
  font-size: 12px;
  color: #8696A0;
  margin: 0;
}
.ctx-remove {
  color: #8696A0;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding: 4px;
  border-radius: 50%;
  transition: color 0.15s, background 0.15s;
}
.ctx-remove:hover { color: #E9EDEF; background: rgba(255,255,255,0.07); }

.ctx-slide-enter-active,
.ctx-slide-leave-active { transition: all 0.2s ease; }
.ctx-slide-enter-from,
.ctx-slide-leave-to { opacity: 0; transform: translateY(-8px); }

/* ─── Messages area ─────────────────────────────── */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.messages-area::-webkit-scrollbar { width: 4px; }
.messages-area::-webkit-scrollbar-track { background: transparent; }
.messages-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

/* ─── Empty state ───────────────────────────────── */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 24px;
  text-align: center;
}
.empty-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #1F2C34;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}
.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #E9EDEF;
  margin: 0;
}
.empty-hint {
  font-size: 13px;
  color: #8696A0;
  line-height: 1.5;
  max-width: 260px;
  margin: 0;
}
.empty-hint kbd {
  display: inline-block;
  padding: 1px 6px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 5px;
  font-family: monospace;
  font-size: 13px;
  color: #E9EDEF;
}

/* ─── Quick suggestion chips ────────────────────── */
.quick-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 4px;
}
.quick-chip {
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: #8696A0;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.quick-chip:hover { background: rgba(255,255,255,0.12); color: #E9EDEF; }

/* ─── Progress context bar variant ─────────────── */
.ctx-bar--progress { background: #1a2234; }
.ctx-bar-accent--progress { background: #38bdf8; }

/* ─── Progress overlay hint ─────────────────────── */
.sheet-progress-hint {
  font-size: 12px;
  color: #8696A0;
  padding: 4px 16px 8px;
  margin: 0;
  line-height: 1.4;
}

/* ─── Message rows ──────────────────────────────── */
.msg-row {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  max-width: 100%;
  animation: msgIn 0.2s ease;
}
.msg-row--user { justify-content: flex-end; }
.msg-row--bot  { justify-content: flex-start; }
@keyframes msgIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.msg-bot-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #2A3942;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-bottom: 2px;
}

/* ─── Bubbles ───────────────────────────────────── */
.bubble {
  padding: 8px 10px 6px;
  border-radius: 8px;
  position: relative;
  word-break: break-word;
}

/* User bubble — WhatsApp dark green */
.bubble--user {
  max-width: min(72%, 480px);
  background: #005C4B;
  border-radius: 8px 0 8px 8px;
}
/* Bot bubble — full width like ChatGPT */
.bubble--bot {
  max-width: 92%;
  background: #1F2C34;
  border-radius: 0 8px 8px 8px;
}

.bubble-text {
  font-size: 14px;
  line-height: 1.45;
  color: #E9EDEF;
}
.bubble-text :deep(strong) { color: #fff; }
.bubble-text :deep(em)     { color: #d0d0d0; font-style: italic; }
.bubble-text :deep(code)   {
  background: rgba(255,255,255,0.1);
  padding: 1px 5px;
  border-radius: 4px;
  font-family: 'SF Mono', monospace;
  font-size: 12px;
  color: #7DD3FC;
}

.bubble-time {
  display: inline-block;
  font-size: 10px;
  color: rgba(255,255,255,0.45);
  margin-top: 2px;
  float: right;
  margin-left: 8px;
  line-height: 1.2;
  position: relative;
  top: 2px;
}

.bubble-ticks {
  display: inline-block;
  margin-left: 3px;
  vertical-align: middle;
  position: relative;
  top: 1px;
}

/* Typing bubble */
.bubble--typing {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 12px 14px;
  min-width: 56px;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #8696A0;
  animation: blink 1.2s ease-in-out infinite;
}
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40%            { opacity: 1;   transform: scale(1); }
}

/* ─── Grade actions ─────────────────────────────── */
.grade-actions {
  display: flex;
  gap: 8px;
  padding: 6px 34px 4px;
  animation: msgIn 0.2s ease;
}
.grade-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  transition: opacity 0.15s, transform 0.1s;
}
.grade-btn:active { transform: scale(0.96); }
.grade-btn--accept {
  background: rgba(37, 211, 102, 0.15);
  color: #25D366;
  border: 1px solid rgba(37, 211, 102, 0.3);
}
.grade-btn--accept:hover { background: rgba(37, 211, 102, 0.22); }
.grade-btn--reject {
  background: rgba(255,255,255,0.06);
  color: #8696A0;
  border: 1px solid rgba(255,255,255,0.1);
}
.grade-btn--reject:hover { background: rgba(255,255,255,0.1); }
.grade-btn--excel {
  background: rgba(33, 150, 243, 0.15);
  color: #64B5F6;
  border: 1px solid rgba(33, 150, 243, 0.3);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.grade-btn--excel:hover { background: rgba(33, 150, 243, 0.25); }

/* Progress overlay actions */
.sheet-progress-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 8px;
  gap: 8px;
}
.sheet-excel-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  background: rgba(33, 150, 243, 0.15);
  color: #64B5F6;
  border: 1px solid rgba(33, 150, 243, 0.3);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.15s;
}
.sheet-excel-btn:disabled { opacity: 0.5; cursor: default; }
.sheet-excel-btn:not(:disabled):hover { background: rgba(33, 150, 243, 0.25); }

/* Per-course Excel icon button */
.sheet-item-row {
  display: flex;
  align-items: center;
  gap: 4px;
}
.sheet-item--flex { flex: 1; min-width: 0; }
.sheet-excel-icon {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(33, 150, 243, 0.12);
  color: #64B5F6;
  border: 1px solid rgba(33, 150, 243, 0.25);
  cursor: pointer;
  transition: background 0.15s;
  margin-right: 8px;
}
.sheet-excel-icon:disabled { opacity: 0.4; cursor: default; }
.sheet-excel-icon:not(:disabled):hover { background: rgba(33, 150, 243, 0.22); }

.grade-done {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #30D158;
  padding: 4px 34px;
}

/* ─── Scroll anchor ─────────────────────────────── */
.scroll-anchor { height: 4px; flex-shrink: 0; }

/* ─── FAB scroll ────────────────────────────────── */
.fab-scroll {
  position: absolute;
  bottom: 74px;
  right: 14px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #182229;
  border: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8696A0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.5);
  z-index: 10;
  transition: background 0.15s;
}
.fab-scroll:hover { background: #1F2C34; }

.fab-pop-enter-active,
.fab-pop-leave-active { transition: all 0.18s ease; }
.fab-pop-enter-from,
.fab-pop-leave-to { opacity: 0; transform: scale(0.7); }

/* ─── Input bar ─────────────────────────────────── */
.input-bar {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 10px;
  background: #1F2C34;
  flex-shrink: 0;
  border-top: 1px solid rgba(255,255,255,0.04);
}

.input-wrap {
  flex: 1;
  background: #2A3942;
  border-radius: 24px;
  padding: 8px 14px;
  display: flex;
  align-items: center;
}

.msg-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  resize: none;
  font-size: 15px;
  color: #E9EDEF;
  line-height: 1.45;
  max-height: 120px;
  overflow-y: auto;
}
.msg-input::placeholder { color: #8696A0; }
.msg-input::-webkit-scrollbar { width: 0; }

.send-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #2A3942;
  color: #8696A0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.18s, color 0.18s, transform 0.1s;
}
.send-btn--active {
  background: #00A884;
  color: #fff;
}
.send-btn--active:hover  { background: #02C78C; }
.send-btn--active:active { transform: scale(0.93); }

.send-btn--mic {
  background: #2A3942;
  color: rgba(255,255,255,0.72);
}
.send-btn--mic:hover {
  background: #354752;
}

.send-btn--recording {
  background: rgba(255, 69, 58, 0.16);
  color: #FF6B62;
  box-shadow: 0 0 0 6px rgba(255, 69, 58, 0.08);
  animation: micPulse 1.2s ease-in-out infinite;
}

.send-btn:disabled { opacity: 0.4; }

/* Image preview bar */
.img-preview-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 10px 10px 0 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.img-preview-thumb {
  width: 36px;
  height: 36px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}
.img-preview-name {
  flex: 1;
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.img-preview-remove {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.img-preview-remove:hover {
  background: rgba(0, 0, 0, 0.08);
  color: #ff4444;
}

/* Image attach button */
.send-btn--attach {
  color: #888;
}
.send-btn--attach:hover {
  color: #00D68F;
  background: rgba(0, 214, 143, 0.08);
}

@keyframes micPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}

/* ─── Message action bar ────────────────────────── */
.msg-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 0 6px 42px;
  animation: msgIn .2s ease;
}

.msg-action-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: rgba(233,237,239,0.35);
  border: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, transform 0.1s;
}
.msg-action-btn:hover {
  background: rgba(255,255,255,0.07);
  color: rgba(233,237,239,0.8);
}
.msg-action-btn:active { transform: scale(0.88); }
.msg-action-btn--active { color: #00A884 !important; }
.msg-action-btn--liked { color: #34C759 !important; }
.msg-action-btn--disliked { color: #FF453A !important; }

/* ─── Bottom sheet overlays ─────────────────────── */
.sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  z-index: 100;
}

.sheet-panel {
  width: 100%;
  max-height: 75dvh;
  background: #1F2C34;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sheet-handle {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255,255,255,0.15);
  margin: 10px auto 0;
  flex-shrink: 0;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px 10px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.sheet-title {
  font-size: 15px;
  font-weight: 600;
  color: #E9EDEF;
}
.sheet-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255,255,255,0.07);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8696A0;
  transition: background 0.15s;
}
.sheet-close:hover { background: rgba(255,255,255,0.12); }

.sheet-search {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: #2A3942;
  margin: 10px 14px;
  border-radius: 10px;
  flex-shrink: 0;
}
.sheet-search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 14px;
  color: #E9EDEF;
}
.sheet-search-input::placeholder { color: rgba(255,255,255,0.3); }

.sheet-back {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px 4px;
  font-size: 13px;
  color: #8696A0;
  flex-shrink: 0;
  transition: color 0.15s;
}
.sheet-back:hover { color: #E9EDEF; }

.sheet-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0 16px;
}
.sheet-list::-webkit-scrollbar { width: 0; }

.sheet-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  transition: background 0.13s;
}
.sheet-item:hover { background: rgba(255,255,255,0.04); }
.sheet-item:active { background: rgba(255,255,255,0.07); }

.sheet-item-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #2A3942;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8696A0;
  flex-shrink: 0;
}
.sheet-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sheet-item-title {
  font-size: 14px;
  font-weight: 500;
  color: #E9EDEF;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sheet-item-sub {
  font-size: 12px;
  color: #8696A0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sheet-item-grade {
  font-size: 13px;
  font-weight: 700;
  color: #25D366;
  flex-shrink: 0;
  background: rgba(37, 211, 102, 0.1);
  padding: 3px 8px;
  border-radius: 10px;
}
.sheet-item-chevron { color: rgba(255,255,255,0.2); flex-shrink: 0; }

.sheet-empty {
  text-align: center;
  font-size: 13px;
  color: #8696A0;
  padding: 16px;
}

/* Skeleton */
.sheet-skel {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}
.skel-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
  flex-shrink: 0;
  animation: pulse 1.4s ease-in-out infinite;
}
.skel-text { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.skel-line {
  border-radius: 4px;
  background: rgba(255,255,255,0.06);
  animation: pulse 1.4s ease-in-out infinite;
}
.skel-title { height: 13px; width: 65%; }
.skel-sub   { height: 11px; width: 45%; }
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.8; }
}

/* Sheet transition */
.sheet-up-enter-active { animation: sheetIn 0.28s cubic-bezier(0.32, 0.72, 0, 1); }
.sheet-up-leave-active { animation: sheetIn 0.2s cubic-bezier(0.32, 0.72, 0, 1) reverse; }
@keyframes sheetIn {
  from { transform: translateY(100%); opacity: 0.6; }
  to   { transform: translateY(0);    opacity: 1; }
}

/* ─── Markdown tables ───────────────────────────── */
.bubble-text :deep(.table-wrapper) {
  overflow-x: auto;
  margin: 8px 0;
  -webkit-overflow-scrolling: touch;
}

.bubble-text :deep(.md-table) {
  border-collapse: collapse;
  width: 100%;
  min-width: 400px;
  font-size: 12px;
  line-height: 1.4;
}

.bubble-text :deep(.md-table th) {
  background: rgba(255, 255, 255, 0.1);
  color: #E9EDEF;
  font-weight: 600;
  text-align: left;
  padding: 8px 10px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  white-space: nowrap;
}

.bubble-text :deep(.md-table td) {
  padding: 6px 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #d1d5db;
  vertical-align: top;
}

.bubble-text :deep(.md-table tbody tr:nth-child(even)) {
  background: rgba(255, 255, 255, 0.03);
}

.bubble-text :deep(.md-table tbody tr:hover) {
  background: rgba(255, 255, 255, 0.06);
}

.bubble--user :deep(.md-table th) {
  background: rgba(0, 0, 0, 0.15);
  border-color: rgba(0, 0, 0, 0.2);
}

.bubble--user :deep(.md-table td) {
  border-color: rgba(0, 0, 0, 0.15);
  color: #E9EDEF;
}

.bubble--user :deep(.md-table tbody tr:nth-child(even)) {
  background: rgba(0, 0, 0, 0.08);
}
</style>
