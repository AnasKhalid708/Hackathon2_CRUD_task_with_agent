{{/*
Expand the name of the chart.
*/}}
{{- define "taskmaster.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "taskmaster.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "taskmaster.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "taskmaster.labels" -}}
helm.sh/chart: {{ include "taskmaster.chart" . }}
{{ include "taskmaster.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "taskmaster.selectorLabels" -}}
app.kubernetes.io/name: {{ include "taskmaster.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Backend labels
*/}}
{{- define "taskmaster.backendLabels" -}}
{{ include "taskmaster.labels" . }}
app.kubernetes.io/component: backend
{{- end }}

{{/*
Backend selector labels
*/}}
{{- define "taskmaster.backendSelectorLabels" -}}
app: taskmaster-backend
{{ include "taskmaster.selectorLabels" . }}
{{- end }}

{{/*
Frontend labels
*/}}
{{- define "taskmaster.frontendLabels" -}}
{{ include "taskmaster.labels" . }}
app.kubernetes.io/component: frontend
{{- end }}

{{/*
Frontend selector labels
*/}}
{{- define "taskmaster.frontendSelectorLabels" -}}
app: taskmaster-frontend
{{ include "taskmaster.selectorLabels" . }}
{{- end }}
