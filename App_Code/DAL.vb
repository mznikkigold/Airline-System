Imports Microsoft.VisualBasic
Imports Microsoft.ApplicationBlocks.Data
Imports System.Data.SqlClient
Imports System.Data

Public Class DAL
    Dim cn As SqlConnection
    Dim Context As HttpContext = HttpContext.Current
    Public Sub New()
        cn = New SqlConnection(ConnectionString.ConnectionString)

    End Sub

    Public Function sp_app_management(ByVal json As String, ByVal action As String) As DataSet
        Try
            Dim params() As SqlParameter = {
                                            New SqlParameter("@JSON", json),
                                            New SqlParameter("@ACTION", action)
                                            }
            Return SqlHelper.ExecuteDataset(cn, CommandType.StoredProcedure, "sp_app_management", params)
        Catch ex As Exception
            BLL.writeLog(ex.Message + " : " + ex.StackTrace)
            Return Nothing
        Finally
            cn.Close()
        End Try
    End Function
    Public Function sp_selection(ByVal json As String, ByVal action As String) As DataSet
        Try
            Dim params() As SqlParameter = {
                                            New SqlParameter("@JSON", json),
                                            New SqlParameter("@ACTION", action)
                                            }
            Return SqlHelper.ExecuteDataset(cn, CommandType.StoredProcedure, "sp_selection", params)
        Catch ex As Exception
            BLL.writeLog(ex.Message + " : " + ex.StackTrace)
            Return Nothing
        Finally
            cn.Close()
        End Try
    End Function

End Class
