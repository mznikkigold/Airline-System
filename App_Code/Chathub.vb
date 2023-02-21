Imports Microsoft.VisualBasic
Imports Microsoft.AspNet.SignalR
Imports Newtonsoft.Json
Imports Newtonsoft.Json.Linq
Imports System.Web.Script.Serialization
Imports System.Data
Imports System.IO
Imports System.Data.SqlClient
Imports System.Globalization
Imports System.Drawing

    Public Class Chathub
        Inherits Hub
        Dim DAL As New DAL
            Dim res As New Dictionary(Of String, Object)() From {
        {"STATUS", "empty"},
        {"MESSAGE", "no rows affected"}
       }
        Dim dt As DataTable
        Dim ds As DataSet
        Dim objOutputList As New List(Of Dictionary(Of String, Object))
        Dim myResponse As New Dictionary(Of String, Object)

    Public Function sp_app_management(ByVal json_string As String, ByVal action_type As String) As String
        Dim status As String = "ERROR"
        Dim dc_return As New Dictionary(Of String, Object)
        BLL.writeLog(action_type)
        Try
            Dim ds As DataSet = DAL.sp_app_management(json_string, action_type)
            Dim dt As DataTable = ds.Tables(0)
            dc_return.Add("RESULT", dt)
            dc_return.Add("ACTION_TYPE", action_type)
            status = "SUCCESS"
           
        Catch ex As Exception
            BLL.writeLog(ex.Message + " : " + ex.StackTrace)
        End Try

        dc_return.Add("STATUS", status)
        Return JsonConvert.SerializeObject(dc_return)
    End Function

      Public Function sp_selection(ByVal json_string As String, ByVal action_type As String) As String
        Dim status As String = "ERROR"
        Dim dc_return As New Dictionary(Of String, Object)
        BLL.writeLog(action_type)
        Try
           ds= DAL.sp_selection(json_string, action_type)
           dt = ds.Tables(0)
            ' dc_return.Add("RESULT", dt)
            ' dc_return.Add("ACTION_TYPE", action_type)
            ' status = "SUCCESS"
             Dim rCount = ds.Tables.Count
            If rCount > 0 Then
                Dim dtOutput As DataTable = ds.Tables(rCount - 1) 'always the last table
                For i As Integer = 0 To rCount - 2
                    res.Add("TABLE_" & i.ToString, ds.Tables(i))
                Next
                If (dtOutput.Rows.Count > 0) Then
                    res.Add("OUTPUT", dtOutput)
                End If
                res.Item("STATUS") = "SUCCESS"
                res.Item("MESSAGE") = "TRANSACTION SUCCESSFUL!"
                Dim strOutput As String = JsonConvert.SerializeObject(objOutputList)
                Dim strResponse As String = JsonConvert.SerializeObject(res)
                ' res = strResponse.ToString()
            Else
                res.Item("STATUS") = "FAILED"
                res.Item("MESSAGE") = "TRANSACTION FAILED!"
            End If
           
        Catch ex As Exception
            BLL.writeLog(ex.Message + " : " + ex.StackTrace)
        End Try
         Return JsonConvert.SerializeObject(res)

        ' dc_return.Add("STATUS", status)
        ' Return JsonConvert.SerializeObject(dc_return)
    End Function

    End Class
