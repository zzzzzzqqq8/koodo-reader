import React from "react";
import Sidebar from "../../components/sidebar/sidebar";
import Header from "../../components/header/header";
import BookList from "../../components/bookList/booklist";
import BookmarkPage from "../../components/bookmarkPage/bookmarkPage";
import NoteList from "../../components/noteList/noteList";
import DigestList from "../../components/digestList/digestList";
import DeleteDialog from "../../components/deleteDialog/deleteDialog";
import EditDialog from "../../components/editDialog/editDialog";
import AddDialog from "../../components/addDialog/addDialog";
import SortDialog from "../../components/sortDialog/sortDialog";
import MessageBox from "../../components/messageBox/messageBox";
import LoadingPage from "../../components/loadingPage/loadingPage";
import BackupPage from "../../components/backupPage/backupPage";
import EmptyPage from "../../components/emptyPage/emptyPage";
import ShelfUtil from "../../utils/shelfUtil";
import WelcomePage from "../../components/welcomePage/welcomePage";
import RecordRecent from "../../utils/recordRecent";
import { connect } from "react-redux";
import {
  handleFetchBooks,
  handleFetchSortCode,
  handleFetchList,
  handleMessageBox,
} from "../../redux/manager.redux";
import {
  handleFetchNotes,
  handleFetchDigests,
  handleFetchBookmarks,
  handleFetchHighlighters,
} from "../../redux/reader.redux";
import "./manager.css";
import BookModel from "../../model/Book";
import NoteModel from "../../model/Note";
import DigestModel from "../../model/Digest";
import BookmarkModel from "../../model/Bookmark";
import { stateType } from "../../store";

export interface ManagerProps {
  books: BookModel[];
  covers: { key: string; url: string }[];
  notes: NoteModel[];
  digests: DigestModel[];
  bookmarks: BookmarkModel[];
  isReading: boolean;
  mode: string;
  shelfIndex: number;
  isOpenEditDialog: boolean;
  isOpenDeleteDialog: boolean;
  isOpenAddDialog: boolean;
  isSort: boolean;
  isSortDisplay: boolean;
  isMessage: boolean;
  isBackup: boolean;
  handleFetchBooks: () => void;
  handleFetchNotes: () => void;
  handleFetchDigests: () => void;
  handleFetchBookmarks: () => void;
  handleFetchHighlighters: () => void;
  handleFetchSortCode: () => void;
  handleFetchList: () => void;
  handleMessageBox: (isShow: boolean) => void;
}

export interface ManagerState {
  totalBooks: number;
  isFirst: string;
  recentBooks: number;
}

class Manager extends React.Component<ManagerProps, ManagerState> {
  timer!: NodeJS.Timeout;
  constructor(props: ManagerProps) {
    super(props);
    this.state = {
      totalBooks: parseInt(localStorage.getItem("totalBooks") || "0") || 0,
      isFirst: "no",
      recentBooks: Object.keys(RecordRecent.getRecent()).length,
    };
  }
  //从indexdb里读取书籍
  UNSAFE_componentWillMount() {
    this.props.handleFetchBooks();
    this.props.handleFetchNotes();
    this.props.handleFetchDigests();
    this.props.handleFetchBookmarks();
    this.props.handleFetchHighlighters();
    this.props.handleFetchSortCode();
    this.props.handleFetchList();
  }

  UNSAFE_componentWillReceiveProps(nextProps: ManagerProps) {
    this.setState({
      totalBooks: this.props.books === null ? 0 : this.props.books.length,
    });
    localStorage.setItem("totalBooks", this.state.totalBooks.toString());

    if (nextProps.isMessage) {
      this.timer = setTimeout(() => {
        this.props.handleMessageBox(false);
        // this.setState({ isMessage: false });
      }, 2000);
    }
  }
  componentDidMount() {
    this.setState({ isFirst: localStorage.getItem("isFirst") || "yes" });
  }

  componentWillUnmout() {
    clearTimeout(this.timer);
  }
  handleCloseWelcome = () => {
    this.setState({ isFirst: "no" });
    localStorage.setItem("isFirst", "no");
  };
  render() {
    let { mode, notes, digests, bookmarks, covers } = this.props;
    let { totalBooks, recentBooks } = this.state;
    let shelfTitle = Object.keys(ShelfUtil.getShelf());
    let currentShelfTitle = shelfTitle[this.props.shelfIndex + 1];
    let shelfBooks = (ShelfUtil.getShelf()[currentShelfTitle] || []).length;
    return (
      <div className="manager">
        <Sidebar />
        <Header />
        <div className="manager-dialog-container">
          {this.props.isOpenDeleteDialog ? (
            <DeleteDialog />
          ) : this.props.isOpenEditDialog ? (
            <EditDialog />
          ) : this.props.isOpenAddDialog ? (
            <AddDialog />
          ) : null}
        </div>
        {this.props.isMessage ? <MessageBox /> : null}
        {this.props.isSortDisplay ? <SortDialog /> : null}
        {this.props.isBackup ? <BackupPage /> : null}
        {this.state.isFirst === "yes" ? (
          <WelcomePage
            handleCloseWelcome={() => {
              this.handleCloseWelcome();
            }}
          />
        ) : null}
        //根据是否添加图书，路由地址等判断body的显示内容
        {totalBooks === 0 ? (
          <EmptyPage />
        ) : covers === null &&
          (mode === "home" || mode === "recent" || mode === "shelf") ? (
          <LoadingPage />
        ) : (mode !== "shelf" || shelfBooks !== 0) &&
          (mode === "home" ||
            (mode === "recent" && recentBooks !== 0) ||
            mode === "shelf") ? (
          <BookList />
        ) : bookmarks !== null && mode === "bookmark" ? (
          <BookmarkPage />
        ) : notes !== null && notes !== undefined && mode === "note" ? (
          <NoteList />
        ) : digests !== null && mode === "digest" ? (
          <DigestList />
        ) : (
          <EmptyPage />
        )}
      </div>
    );
  }
}
const mapStateToProps = (state: stateType) => {
  return {
    books: state.manager.books,
    covers: state.manager.covers,
    notes: state.reader.notes,
    digests: state.reader.digests,
    bookmarks: state.reader.bookmarks,
    isReading: state.book.isReading,
    mode: state.sidebar.mode,
    shelfIndex: state.sidebar.shelfIndex,
    isOpenEditDialog: state.book.isOpenEditDialog,
    isOpenDeleteDialog: state.book.isOpenDeleteDialog,
    isOpenAddDialog: state.book.isOpenAddDialog,
    isSort: state.manager.isSort,
    isSortDisplay: state.manager.isSortDisplay,
    isMessage: state.manager.isMessage,
    isBackup: state.backupPage.isBackup,
  };
};
const actionCreator = {
  handleFetchBooks,
  handleFetchNotes,
  handleFetchDigests,
  handleFetchBookmarks,
  handleFetchHighlighters,
  handleFetchSortCode,
  handleFetchList,
  handleMessageBox,
};
export default connect(mapStateToProps, actionCreator)(Manager);
